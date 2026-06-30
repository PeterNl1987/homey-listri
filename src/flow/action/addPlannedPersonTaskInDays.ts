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
        // Homey SDK runs in UTC time, not in local time. So to get today as local time, we have to get the Homey timezone and do below logic.
        var date = new Date();
        date.setDate(date.getDate() + args.days);
        const timezone = this.homey.clock.getTimezone();

        const parts = new Intl.DateTimeFormat(undefined, {
            timeZone: timezone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        }).formatToParts(date);

        const day = Number(parts.find(p => p.type === 'day')?.value);
        const month = Number(parts.find(p => p.type === 'month')?.value);
        const year = Number(parts.find(p => p.type === 'year')?.value);

        var dateString =
            year
            + "-" + String(month + 1).padStart(2, '0')
            + "-" + String(day).padStart(2, '0')

        await args.list.addTask(args.task, dateString, args.time, args.person);
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
