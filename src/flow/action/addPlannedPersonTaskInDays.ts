import { action, DateTime, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';
import { AutocompleteProviders } from '..';

@action('add_planned_person_task_in_days')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onInit(): Promise<void> {
        this.registerAutocomplete('person', AutocompleteProviders.Person);

        await super.onInit();
    }

    async onRun(args: Args): Promise<void> {
        var dateTime = DateTime.now();
        dateTime = dateTime.plus({ days: args.days });
        
        await args.list.addTask(args.task, dateTime.toFormat("yyyy-MM-dd"), args.time, args.person);
    }
}

type Args = {
    readonly list: BasicListDevice;
    readonly task: string;
    readonly days: number;
    readonly time: string;
    readonly person: {
        readonly id: string;
        readonly name: string;
        readonly image: string | undefined;
    };
};
