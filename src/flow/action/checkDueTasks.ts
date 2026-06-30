import { action, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';

@action('check_due_tasks')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onRun(args: Args): Promise<void> {
        var tasks = await args.list.findTasksDue();
        const failures: string[] = [];

        // One by one, as using Promise.all won't check them all
        for (const task of tasks) {
            try {
                await args.list.check(task.id);
            } catch {
                failures.push(task.id);
            }

        }
        if (failures.length > 0) {
            throw new Error(`Failed to check ${failures.length} due task(s).`);
        }
    }
}

type Args = {
    readonly list: BasicListDevice;
};
