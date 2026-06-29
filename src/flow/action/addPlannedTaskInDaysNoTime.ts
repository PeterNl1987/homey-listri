import { action, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';

@action('add_planned_task_in_days_no_time')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onRun(args: Args): Promise<void> {
        var date = new Date();
        date.setDate(date.getDate() + args.days);
        var dateString = 
            date.getFullYear()
            + "-" + String(date.getMonth() + 1).padStart(2, '0')
            + "-" + String(date.getDate()).padStart(2, '0')

        await args.list.addTask(args.task, dateString);
    }
}

type Args = {
    readonly list: BasicListDevice;
    readonly task: string;
    readonly days: number;
};
