import { action, DateTime, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';

@action('add_planned_task_dynamic')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onRun(args: Args): Promise<void> {
        await args.list.addTask(args.task, args.date, args.time);
    }
}

type Args = {
    readonly list: BasicListDevice;
    readonly task: string;
    readonly date: string;
    readonly time?: string;
};
