import { action, DateTime, FlowActionEntity } from '@basmilius/homey-common';
import type { BasicListDevice } from '../../list';
import type { ListriApp } from '../../types';
import { AutocompleteProviders } from '..';

@action('add_planned_person_task')
export default class extends FlowActionEntity<ListriApp, Args> {
    async onInit(): Promise<void> {
        this.registerAutocomplete('person', AutocompleteProviders.Person);

        await super.onInit();
    }

    async onRun(args: Args): Promise<void> {
        // Date input fields are always sent as dd-MM-yyyy , no matter the locale. See documentation.
        var splittedDate = args.date.split('-');
        var dateInput = splittedDate[2] + "-" + splittedDate[1] + "-" + splittedDate[0];
        
        await args.list.addTask(args.task, dateInput, args.time, args.person);
    }
}

type Args = {
    readonly list: BasicListDevice;
    readonly task: string;
    readonly date: string;
    readonly time: string;
    readonly person: {
        readonly id: string;
        readonly name: string;
        readonly image: string | undefined;
    };
};
