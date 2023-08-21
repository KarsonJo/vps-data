import { ColumnDefinition as TabulatorColumnDefinition } from 'tabulator-tables';

declare module 'tabulator-tables' {
    interface ColumnDefinition extends TabulatorColumnDefinition {
        clickPopup?: any; // Add the missing property
    }
}