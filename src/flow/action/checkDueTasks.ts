import { action, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';

@action('check_due_tasks')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onRun(args: Args): Promise<void> {
        var tasks = await args.list.findTasksDue();

        // One by one, using Promise.all won't check them all
        for (const task of tasks) {
            await args.list.check(task.id);
        }
    }
}

type Args = {
    readonly list: BasicListDevice;
};
