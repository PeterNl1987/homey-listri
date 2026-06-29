import { App, Luxon } from '@basmilius/homey-common';
import { HomeyAPI, HomeyAPIV3Local } from 'homey-api';
import { Actions, AutocompleteProviders, Conditions, Triggers } from './flow';

export default class ListriApp extends App<ListriApp> {

    get api(): HomeyAPIV3Local {
        return this.#api;
    }

    #api!: HomeyAPIV3Local;

    async onInit() {
        try {
            this.#api = await HomeyAPI.createAppAPI({
                homey: this.homey
            });
            this.#api.isConnected();

            Luxon.defaultZone = this.homey.clock.getTimezone();

            this.#registerAutocompleteProviders();
            this.#registerActions();
            this.#registerConditions();
            this.#registerTriggers();

            await Promise.allSettled(
                this.registry.autocompleteProviders.map(provider => provider.onInit())
            );

            this.log('Listri has been initialized');
        } catch (err) {
            this.log('Failed to initialize Listri', err);
        }
    }

    #registerActions(): void {
        this.registry.action(Actions.AddNote);
        this.registry.action(Actions.AddPersonTask);
        this.registry.action(Actions.AddPlannedTask);
        this.registry.action(Actions.AddPlannedTaskNoTime);
        this.registry.action(Actions.AddPlannedTaskInDays);
        this.registry.action(Actions.AddPlannedTaskInDaysNoTime);
        this.registry.action(Actions.AddPlannedPersonTask);
        this.registry.action(Actions.AddPlannedPersonTaskNoTime);
        this.registry.action(Actions.AddPlannedPersonTaskInDays);
        this.registry.action(Actions.AddPlannedPersonTaskInDaysNoTime);
        this.registry.action(Actions.AddProduct);
        this.registry.action(Actions.AddProductQuantity);
        this.registry.action(Actions.AddTask);
        this.registry.action(Actions.ClearList);
        this.registry.action(Actions.CheckProduct);
        this.registry.action(Actions.CheckTask);
        this.registry.action(Actions.GetContents);
        this.registry.action(Actions.GetContentsMarkdown);
        this.registry.action(Actions.RemoveChecked);
        this.registry.action(Actions.RemoveNote);
        this.registry.action(Actions.RemoveProduct);
        this.registry.action(Actions.RemoveTask);
        this.registry.action(Actions.SetProductCategory);
        this.registry.action(Actions.SetProductQuantity);
        this.registry.action(Actions.UncheckProduct);
        this.registry.action(Actions.UncheckTask);
    }

    #registerAutocompleteProviders(): void {
        this.registry.autocompleteProvider(AutocompleteProviders.Category);
        this.registry.autocompleteProvider(AutocompleteProviders.Person);
    }

    #registerConditions(): void {
        this.registry.condition(Conditions.NoteExists);
        this.registry.condition(Conditions.ProductExists);
        this.registry.condition(Conditions.ProductHasQuantity);
        this.registry.condition(Conditions.ProductIsChecked);
        this.registry.condition(Conditions.TaskExists);
        this.registry.condition(Conditions.TaskIsChecked);
    }

    #registerTriggers(): void {
        this.registry.deviceTrigger(Triggers.NoteCreated);
        this.registry.deviceTrigger(Triggers.NoteRemoved);
        this.registry.deviceTrigger(Triggers.ProductChecked);
        this.registry.deviceTrigger(Triggers.ProductCheckedAny);
        this.registry.deviceTrigger(Triggers.ProductCreated);
        this.registry.deviceTrigger(Triggers.ProductQuantityChanged);
        this.registry.deviceTrigger(Triggers.ProductRemoved);
        this.registry.deviceTrigger(Triggers.ProductUnchecked);
        this.registry.deviceTrigger(Triggers.ProductUncheckedAny);
        this.registry.deviceTrigger(Triggers.TaskChecked);
        this.registry.deviceTrigger(Triggers.TaskCheckedAny);
        this.registry.deviceTrigger(Triggers.TaskCreated);
        this.registry.deviceTrigger(Triggers.TaskDueDatePassed);
        this.registry.deviceTrigger(Triggers.TaskRemoved);
        this.registry.deviceTrigger(Triggers.TaskUnchecked);
        this.registry.deviceTrigger(Triggers.TaskUncheckedAny);
    }

}
