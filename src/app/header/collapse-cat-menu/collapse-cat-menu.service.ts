import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class CollapseCatMenuService {
    isOpen: boolean = false;

    statusUpdated = new EventEmitter<boolean>();

    constructor() { }

    categoryCollapseChange(status: boolean) {
        this.isOpen = status;
    }

    getCategoryCollapseStatus() {
        return this.isOpen;
    }
}