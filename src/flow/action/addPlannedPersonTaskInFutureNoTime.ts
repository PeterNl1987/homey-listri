import { action, DateTime, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';
import { AutocompleteProviders } from '..';

@action('add_planned_person_task_in_future_no_time')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onInit(): Promise<void> {
        this.registerAutocomplete('person', AutocompleteProviders.Person);

        await super.onInit();
    }

    async onRun(args: Args): Promise<void> {
        var date = new Date();
        date.setDate(date.getDate() + args.days);
        var dateString = 
            date.getFullYear()
            + "-" + String(date.getMonth()).padStart(2, '0')
            + "-" + String(date.getDate()).padStart(2, '0')

        await args.list.addTask(args.task, dateString, undefined, args.person);
    }
}

type Args = {
    readonly list: BasicListDevice;
    readonly task: string;
    readonly days: number;
    readonly person: {
        readonly id: string;
        readonly name: string;
        readonly image: string | undefined;
    };
};
