import { Routes } from "@angular/router";
import { ParentFacade } from "./application/parent.facade";
import { PARENT_REPOSITORY } from "./domain/repositories/parent.repository";
import { ParentService } from "./infrastructure/parent.service";

const PARENT_ROUTE_PROVIDERS = [
  ParentFacade,
  { provide: PARENT_REPOSITORY, useClass: ParentService },
];

export const PARENT_ROUTES: Routes = [
  {
    path: "",
    providers: PARENT_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/list/parent-list.component").then(
        (m) => m.ParentListComponent,
      ),
  },
  {
    path: "links",
    providers: PARENT_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/list/parent-list.component").then(
        (m) => m.ParentListComponent,
      ),
    data: { tab: "links" },
  },
  {
    path: "messages",
    providers: PARENT_ROUTE_PROVIDERS,
    loadComponent: () =>
      import("./presentation/list/parent-list.component").then(
        (m) => m.ParentListComponent,
      ),
    data: { tab: "messages" },
  },
];
