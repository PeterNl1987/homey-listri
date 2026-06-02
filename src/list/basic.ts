import { DateTime } from '@basmilius/homey-common';
import { Triggers } from '../flow';
import { ListDevice, ListDriver } from './base';
import type { ListItemPerson, TaskListItem } from './item';
import { dueDateTime } from './item';

export class BasicListDevice extends ListDevice<BasicListDriver> {

    get tasks(): TaskListItem[] {
        return this.items.filter(item => item.type === 'task');
    }

    async check(id: string, checked: boolean = true): Promise<boolean> {
        const item = await this.find(id);
        const result = await super.check(id, checked);

        if (!result || !item || item.type !== 'task') {
            return false;
        }

        // Clear triggered state when task is checked
        if (checked) {
            this.appDriver.clearTriggeredTask(this, item.id);
            await Promise.allSettled([
                this.appDriver.triggerTaskChecked(this, item.content),
                this.appDriver.triggerTaskCheckedAny(this, item.content)
            ]);
        } else {
            await Promise.allSettled([
                this.appDriver.triggerTaskUnchecked(this, item.content),
                this.appDriver.triggerTaskUncheckedAny(this, item.content)
            ]);
        }

        return true;
    }

    async addTask(content: string, dueDate?: string, dueTime?: string, person?: ListItemPerson): Promise<void> {
        const date = dueDate ? DateTime.fromISO(dueDate) : undefined;
        const time = dueTime ? DateTime.fromISO(dueTime) : undefined;
        const dateString = date?.toFormat('yyyy-MM-dd');
        const timeString = time?.toFormat('HH:mm:ss');
        
        await this.add<TaskListItem>({
            type: 'task',
            checked: false,
            content,
            dueDate: dateString,
            dueTime: timeString,
            person
        });

        await this.appDriver.triggerTaskCreated(this, content, person?.name, dueDateTime(dateString, timeString)?.toISO() ?? undefined);
    }

    async editTask(id: string, content: string, dueDate?: string, dueTime?: string, person?: ListItemPerson): Promise<boolean> {
        const item = await this.find(id);

        if (!item || item.type !== 'task') {
            return false;
        }

        const _date = dueDate ? DateTime.fromISO(dueDate) : undefined;
        const _time = dueTime ? DateTime.fromISO(dueTime) : undefined;

        // todo(Bas): Maybe add a trigger card here for when a task is changed.
        await this.set(item, 'content', content);
        await this.set(item, 'dueDate', _date?.toFormat('yyyy-MM-dd'));
        await this.set(item, 'dueTime', _time?.toFormat('HH:mm:ss'));
        await this.set(item, 'person', person);

        return true;
    }

    async findTask(content: string): Promise<TaskListItem | null> {
        return this.tasks.find(item => item.content === content) ?? null;
    }

    async findTaskId(content: string): Promise<string | null> {
        return this.tasks.find(item => item.content === content)?.id ?? null;
    }

    async removeTask(content: string): Promise<boolean> {
        const task = await this.findTask(content);

        if (!task) {
            return false;
        }

        const result = await super.remove(task.id);

        if (!result) {
            return false;
        }

        // Clear triggered state when task is removed
        this.appDriver.clearTriggeredTask(this, task.id);
        await this.appDriver.triggerTaskRemoved(this, task.content);

        return true;
    }

}

export class BasicListDriver extends ListDriver {

    #dueDateCheckInterval?: NodeJS.Timeout;
    #triggeredTasks: Set<string> = new Set();

    async onInit(): Promise<void> {
        await super.onInit();

        this.#startDueDateCheck();

        this.log('Basic list driver has been initialized.');
    }

    async onUninit(): Promise<void> {
        if (this.#dueDateCheckInterval) {
            this.homey.clearInterval(this.#dueDateCheckInterval);
        }

        await super.onUninit();
    }

    #startDueDateCheck(): void {
        this.#dueDateCheckInterval = this.homey.setInterval(() => {
            this.#checkDueDates().catch(err => this.error('Due date check failed:', err));
        }, 15 * 1000);
    }

    async #checkDueDates(): Promise<void> {
        this.log('Checking due dates...');

        const now = DateTime.now();
        const devices = this.getDevices() as BasicListDevice[];

        for (const device of devices) {
            for (const task of device.tasks) {
                // Skip if task is already checked
                if (task.checked) {
                    continue;
                }

                // Get the due date/time for this task
                const due = dueDateTime(task.dueDate, task.dueTime);
                
                if (!due) {
                    continue;
                }

                // Check if due date has passed
                if (due < now) {
                    // Create a unique key for this task to avoid duplicate triggers
                    const taskKey = `${device.getData().id}-${task.id}`;
                    
                    if (!this.#triggeredTasks.has(taskKey)) {
                        this.#triggeredTasks.add(taskKey);

                        try {
                            // due is guaranteed to be defined here, toISO() returns string (empty string fallback for safety)
                            await this.triggerTaskDueDatePassed(device, task.content, task.person?.name, due.toISO() ?? '');
                        } catch (err) {
                            this.error(`Failed to trigger due date passed for task "${task.content}":`, err);
                            // Remove from triggered set so we can retry later
                            this.#triggeredTasks.delete(taskKey);
                        }
                    }
                } else {
                    // If the due date hasn't passed yet, remove it from triggered set
                    // (in case the due date was changed)
                    const taskKey = `${device.getData().id}-${task.id}`;
                    this.#triggeredTasks.delete(taskKey);
                }
            }
        }
    }

    async triggerTaskCheckedAny(list: ListDevice, task: string): Promise<void> {
        await this.app.registry.fireDeviceTrigger(Triggers.TaskCheckedAny, list, {task}, {task});
    }

    async triggerTaskChecked(list: ListDevice, task: string): Promise<void> {
        await this.app.registry.fireDeviceTrigger(Triggers.TaskChecked, list, {task});
    }

    async triggerTaskCreated(list: ListDevice, task: string, person?: string, due?: string): Promise<void> {
        await this.app.registry.fireDeviceTrigger(Triggers.TaskCreated, list, {task}, {task, person: person ?? '', due: due ?? ''});
    }

    async triggerTaskRemoved(list: ListDevice, task: string): Promise<void> {
        await this.app.registry.fireDeviceTrigger(Triggers.TaskRemoved, list, {task}, {task});
    }

    async triggerTaskUnchecked(list: ListDevice, task: string): Promise<void> {
        await this.app.registry.fireDeviceTrigger(Triggers.TaskUnchecked, list, {task});
    }

    async triggerTaskUncheckedAny(list: ListDevice, task: string): Promise<void> {
        await this.app.registry.fireDeviceTrigger(Triggers.TaskUncheckedAny, list, {task}, {task});
    }

    async triggerTaskDueDatePassed(list: ListDevice, task: string, person?: string, due?: string): Promise<void> {
        await this.app.registry.fireDeviceTrigger(Triggers.TaskDueDatePassed, list, {task}, {task, person: person ?? '', due: due ?? ''});
    }

    clearTriggeredTask(list: ListDevice, taskId: string): void {
        const taskKey = `${list.getData().id}-${taskId}`;
        this.#triggeredTasks.delete(taskKey);
    }

}
