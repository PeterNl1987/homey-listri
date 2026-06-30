import { action, DateTime, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';

@action('add_planned_task_in_days')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onRun(args: Args): Promise<void> {
                var dateTime = DateTime.now();
                dateTime = dateTime.plus({ days: args.days });
                
                await args.list.addTask(args.task, dateTime.toFormat("yyyy-MM-dd"), args.time);
    }
}

type Args = {
    readonly list: BasicListDevice;
    readonly task: string;
    readonly days: number;
    readonly time: string;
};
