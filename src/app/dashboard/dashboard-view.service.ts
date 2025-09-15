import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { MessagesModComponent } from '@app/dashboard/messages-mod/messages-mod.component';
import { QueryTaskModComponent } from '@app/dashboard/query-task-mod/query-task-mod.component';
import { ModuleDraggableItem, ModuleDroppableEventObject } from '@app/shared/module-drag-and-drop-resize/module-drag-and-drop.model';
import { NotificationsModComponent } from '@app/dashboard/notifications-mod/notifications-mod.component';
import { ModuleData } from '@app/shared/models/module-data.model';
import { NotesModComponent } from '@app/dashboard/notes-mod/notes-mod.component';
import { ToastService } from '@app/shared/toast/toast.service';
import { Store } from '@ngrx/store';
import { delay, exhaustMap, filter, map, skip, take, takeUntil, tap } from 'rxjs/operators';
import { Constants } from '@assets/constants/constants';
import { authFeature } from '@app/auth/store/auth.reducer';
import { MenuGroup } from '@app/shared/models/menu-group.model';
import { ModulePrefData } from '@app/shared/models/module-pref-data';
import { ModulesAndActionType, ModuleViewAdjustAction } from '@app/dashboard/models/module-view-adjust-action.enum';
import { User } from '@app/shared/models/user.model';
import { AuthService } from '@app/auth/auth.service';
import { InternalAuditService } from '@app/audit/internal-audit.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { elementRefRetry } from '@app/shared/utilities-and-functions/element-ref-retry.function';
import { Action } from '@app/shared/models/action.model';

export type DarkMode = 'dark' | 'light' | 'system';

@Injectable({
  providedIn: 'root'
})
export class DashboardViewService extends InternalAuditService implements OnDestroy {
  private toastService = inject(ToastService);
  readonly store = inject(Store);
  private authService = inject(AuthService);

  messagesDraggable: ModuleDraggableItem;
  queryTaskDraggable: ModuleDraggableItem;
  notificationsDraggable: ModuleDraggableItem;
  notesDraggable: ModuleDraggableItem;
  private modulesMap: Map<String, ModuleData> = new Map<String, ModuleData>();

  public droppableZones: any[] = [];
  private zonePrefix = 'zone-';
  private allModules: ModuleDraggableItem[] = [];
  public readonly modules$ = new BehaviorSubject<ModulesAndActionType>(new ModulesAndActionType(ModuleViewAdjustAction.unknown, [[], [], [], []]));
  public readonly availableModules$ = new BehaviorSubject<ModuleData[]>([]);
  private availableModules: ModuleData[] = [];

  readonly viewAdjust$ = new BehaviorSubject<boolean>(false);
  readonly onViewAdjust$ = new Subject<boolean>();
  readonly isDragging$ = new BehaviorSubject<boolean>(false);
  readonly activateNotices$ = new BehaviorSubject<boolean>(false);

  public widthGapPercentage = 0;
  public heightGapPercentage = 0;
  private collapsedModHeaderSize = 0;

  private readonly unsub$ = new Subject<void>();

  public loadingDashboard$ = new BehaviorSubject<boolean>(false);
  public moduleDataAtViewAdjustStart: ModulePrefData[] | undefined;
  private dashboardMenu: MenuGroup[] = [];

  readonly darkMode$ = new BehaviorSubject<DarkMode>('system');
  readonly isInDarkMode$ = this.darkMode$.pipe(map(v => {
      switch (v) {
        case 'dark':
          return true;
        case 'light':
          return false;
        case 'system':
        default:
          const prefersDarkScheme: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
          return prefersDarkScheme.matches;
      }
    })
  );


  constructor() {
    super('DashboardViewService');

    this.loadingDashboard$.pipe(takeUntilDestroyed()).subscribe(v => console.log('loading dashboard' ,v));
    this.modules$.pipe(takeUntilDestroyed()).subscribe(v => console.log('modules' ,v));

    this.modulesMap.set(Constants.DASHBOARD_MODS.MESSAGES, new ModuleData(
      Constants.DASHBOARD_MODS.MESSAGES,
      1,
      MessagesModComponent,
      11,
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      .66666,
      .4,
      .33333,
      .33,
      'messaging'
    ));

    this.modulesMap.set(Constants.DASHBOARD_MODS.QUERY_TASK, new ModuleData(
      Constants.DASHBOARD_MODS.QUERY_TASK,
      3,
      QueryTaskModComponent,
      21,
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      1,
      .66,
      .66,
      .3,
      'task'
    ));
    this.modulesMap.set(Constants.DASHBOARD_MODS.NOTIFICATIONS, new ModuleData(
      Constants.DASHBOARD_MODS.NOTIFICATIONS,
      2,
      NotificationsModComponent,
      12,
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      .33,
      .25,
      .33,
      .3,
      'messaging'
    ));

    this.modulesMap.set(Constants.DASHBOARD_MODS.PERSONAL_NOTES, new ModuleData(
      Constants.DASHBOARD_MODS.PERSONAL_NOTES,
      4,
      NotesModComponent,
      22,
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject<boolean>(false),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      new BehaviorSubject(0),
      .33,
      .25,
      .66,
      .3,
      'notes'
    ));

    this.queryTaskDraggable = new ModuleDraggableItem(
      [],
      this.modulesMap.get(Constants.DASHBOARD_MODS.QUERY_TASK)
    );
    this.notificationsDraggable = new ModuleDraggableItem(
      [],
      this.modulesMap.get(Constants.DASHBOARD_MODS.NOTIFICATIONS)
    );
    this.notesDraggable = new ModuleDraggableItem(
      [],
      this.modulesMap.get(Constants.DASHBOARD_MODS.PERSONAL_NOTES)
    );
    this.messagesDraggable = new ModuleDraggableItem(
      [],
      this.modulesMap.get(Constants.DASHBOARD_MODS.MESSAGES)
    );

    let i = 11;
    while (i < 13) {
      this.droppableZones.push({
        data: {
          rowColumn: i
        },
        zone: this.zonePrefix + i
      });
      i++;
    }
    i = 21;
    while (i < 23) {
      this.droppableZones.push({
        data: {
          rowColumn: i
        },
        zone: this.zonePrefix + i
      });
      i++;
    }

    this.store.select(authFeature.selectUser).pipe(
      filter((user: User) => user.userId !== undefined),
      take(1),
      tap((user: User) => {
        this.getUserSecurityAndSettingsAndPushModules(user.userId!);
      }),
      exhaustMap(() =>
        this.authService.selectAuthUserIdAndFilterForUserIdChanges([this.unsub$]).pipe(
          skip(1)
        ))
    ).subscribe((userId) => {
      this.cancelViewAdjustOnUserChange();
      this.getUserSecurityAndSettingsAndPushModules(userId);
    });

    this.onViewAdjust$.pipe(takeUntil(this.unsub$), filter(v => v)).subscribe(() => this.onViewAdjust());

    let taskQuery = this.availableModules.find(module => module.preferencesKey === 'task');
    if (taskQuery) {
      this.addModule(taskQuery);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.unsub$.next();
    this.unsub$.complete();
  }

  private generateDropZones(rowColumn: number): string[] {
    // Generate all available drop zones
    const zones: string[] = [];
    for (const zone of this.droppableZones) {
      if (zone.data.rowColumn !== rowColumn) {
        zones.push(this.zonePrefix + zone.data.rowColumn);
      }
    }
    zones.push('delete');
    return zones;
  };

  private setAvailableModulesOnInit(): void {
    if (this.dashboardMenu.length > 0) {
      this.dashboardMenu[0].actions.map((act) => act.actionName).forEach((actionName) => {
        if (this.modulesMap.get(actionName) !== undefined) {
          this.availableModules.push(this.modulesMap.get(actionName)!);
        }
      });
    }
  }

  private getUserSecurityAndSettingsAndPushModules(userId: string): void {
    this.loadingDashboard$.next(true);
    this.availableModules = [];

    const actions: MenuGroup[] = [
      new MenuGroup(
        25,
        'dashboard',
        'M',
        'dashboard',
        [
          new Action({
              'actionId': 73,
              'actionUrl': 'messaging',
              'actionName': 'Messages',
              'active': 'Y',
              'styling': '{"preferredWidth":"0.6666","preferredHeight":"0.3333"}',
              'tooltip': 'Inbox views  |  Notifications  |  Email forwarding  |  Alerts',
              'roles': [
                'DPS_Agent',
                'DPS_Agent_Logistics',
                'DPS_Agent_Technical',
                'DPS_Bernard_Chaus',
                'DPS_Color_Analyst',
                'DPS_Coordinator',
                'DPS_Customs',
                'DPS_Designer',
                'DPS_Director',
                'DPS_Domestic_Manufacturer',
                'DPS_Freight_Forwarder',
                'DPS_Import_Manufacturer',
                'DPS_Inspector',
                'DPS_Library',
                'DPS_Logistics',
                'DPS_Packaging',
                'DPS_Quality_Control',
                'DPS_Sourcing_Director',
                'DPS_Staff',
                'DPS_Technician',
                'DPS_Technician_Admin',
                'DPS_Admin',
                'DPS_Support'
              ],
              'seq': 1,
              'locale': ''
            }),
          new Action({
            'actionId': 74,
            'actionUrl': 'messaging',
            'actionName': 'Notifications',
            'active': 'Y',
            'styling': '{"preferredWidth":"0.3333","preferredHeight":"0.3333"}',
            'tooltip': 'Inbox views  |  Notifications  |  Email forwarding  |  Alerts',
            'roles': [
              'DPS_Agent',
              'DPS_Agent_Logistics',
              'DPS_Agent_Technical',
              'DPS_Bernard_Chaus',
              'DPS_Color_Analyst',
              'DPS_Coordinator',
              'DPS_Customs',
              'DPS_Designer',
              'DPS_Director',
              'DPS_Domestic_Manufacturer',
              'DPS_Freight_Forwarder',
              'DPS_Import_Manufacturer',
              'DPS_Inspector',
              'DPS_Library',
              'DPS_Logistics',
              'DPS_Packaging',
              'DPS_Quality_Control',
              'DPS_Sourcing_Director',
              'DPS_Staff',
              'DPS_Technician',
              'DPS_Technician_Admin',
              'DPS_Admin',
              'DPS_Support'
            ],
            'seq': 2,
            'locale': ''
          }),
          new Action({
            'actionId': 72,
            'actionUrl': 'task',
            'actionName': 'Task/Query',
            'active': 'Y',
            'styling': '{"preferredWidth":"1","preferredHeight":"0.6666"}',
            'tooltip': 'Close Tabs  |  Reset to default tabs  |  Rows to load',
            'roles': [
              'DPS_Agent',
              'DPS_Agent_Logistics',
              'DPS_Agent_Technical',
              'DPS_ADPL_Import',
              'DPS_Bernard_Chaus',
              'DPS_Color_Analyst',
              'DPS_Coordinator',
              'DPS_Customs',
              'DPS_Designer',
              'DPS_Director',
              'DPS_Domestic_Manufacturer',
              'DPS_Finance',
              'DPS_Freight_Forwarder',
              'DPS_Import_Manufacturer',
              'DPS_Inspector',
              'DPS_Library',
              'DPS_Logistics',
              'DPS_Mail_Room',
              'DPS_Packaging',
              'DPS_Quality_Control',
              'DPS_Sourcing_Director',
              'DPS_Staff',
              'DPS_Technician',
              'DPS_Technician_Admin',
              'DPS_Admin',
              'DPS_Support'
            ],
            'seq': 3,
            'locale': ''
          })
        ],
        [],
      )
    ];

          if (actions.length > 0) {
            this.dashboardMenu = actions.filter(obj => obj.name == Constants.MODULE_TYPES.DASHBOARD);
            this.setAvailableModulesOnInit();
          }

          const calculateSizeInitViewAndNextModules = () => {
            this.calcModuleSizes().subscribe(() => {
              let modules = this.arrangeAndSortAllModulesToGrid();
              // first emission:
              this.modules$.next({ modules, type: ModuleViewAdjustAction.unknown });
              this.reinitModuleViewFromData(modules);
              this.loadingDashboard$.next(false);
            });
          };


          //get user's modules
          this.allModules = [];
          const prefs = [
            {
              'user': 'WILDHPA',
              'module': 'dashboard',
              'settings': {
                'stylePart1NavigationMenuOnboarding': 1,
                'darkMode': 'light',
                'modules': [
                  {
                    'name': 'Messages',
                    'preferencesKey': 'messaging',
                    'id': 1,
                    'rowColumn': 11,
                    'expanded': false,
                    'collapsed': false,
                    'preferredWidth': 0.6666,
                    'preferredHeight': 0.3333
                  },
                  {
                    'name': 'Notifications',
                    'preferencesKey': 'messaging',
                    'id': 2,
                    'rowColumn': 12,
                    'expanded': false,
                    'collapsed': false,
                    'preferredWidth': 0.3333,
                    'preferredHeight': 0.3333
                  },
                  {
                    'name': 'Task/Query',
                    'preferencesKey': 'task',
                    'id': 3,
                    'rowColumn': 21,
                    'expanded': false,
                    'collapsed': false,
                    'preferredWidth': 1,
                    'preferredHeight': 0.6666
                  }
                ]
              },
              'updateSt': '2025-09-12 14:10:33.000448',
              'updateUser': 'WILDHPA'
            }
          ];
          this.darkMode$.next(prefs[0].settings.darkMode as DarkMode);
          let prefsArr = prefs[0].settings.modules.map(m => new ModulePrefData(m));
          prefsArr.forEach(modulePref => {  //build ModuleData for user's modules
            if (this.modulesMap.get(modulePref.name) !== undefined) {
              Object.assign(this.modulesMap.get(modulePref.name)!, modulePref);
              this.allModules.push(new ModuleDraggableItem(
                this.generateDropZones(modulePref.rowColumn),
                this.modulesMap.get(modulePref.name)
              ));
            }
          });
          //filter out selected modules from availableModules
          let filteredModules: ModuleData[] = [];
          let allModuleData = this.allModules.map(module => {
            return module.data;
          });
          this.availableModules.forEach(mod => {
            if (allModuleData.indexOf(mod) < 0)
              filteredModules.push(mod);
          });
          this.availableModules = filteredModules;
          this.availableModules$.next(this.availableModules);
          calculateSizeInitViewAndNextModules();
  }

  private arrangeAndSortAllModulesToGrid(): ModuleDraggableItem[][] {
    const modules: ModuleDraggableItem[][] = [[], []];
    for (const module of this.allModules) {
      switch (true) {
        case module.data.rowColumn >= 20:
          modules[1].push(module);
          break;
        case module.data.rowColumn >= 10:
          modules[0].push(module);
      }
    }
    for (const modRow of modules) {
      modRow.sort((a, b) => a.data.rowColumn - b.data.rowColumn);
    }
    return modules;
  }

  public updateModules$(type: ModuleViewAdjustAction, modules?: ModuleDraggableItem[][]): void {
    this.checkAndStoreModulesBeforeChanges();
    if (!modules) {
      modules = this.arrangeAndSortAllModulesToGrid();
    }
    for (const module of this.allModules) {
      module.zones = this.generateDropZones(module.data.rowColumn);
    }
    this.modules$.next({ modules, type });
    this.viewNormal();
    this.changePositionValues(modules);
  }


  public calcModuleSizes(): Observable<any> {
    return elementRefRetry(() => window, 20, 2).pipe(
      map(() => {
        this.heightGapPercentage = 24 / (window.innerHeight - 66) * 100;
        this.widthGapPercentage = 24 / (window.innerWidth - 66) * 100;
        this.collapsedModHeaderSize = (26 + 12 + 14) / (window.innerHeight - 66) * 100;
      }));
  }

  public onWindowResize() {
    this.calcModuleSizes().subscribe(() => {
      this.reinitModuleViewFromData();
      if (this.viewAdjust$.value) {
        of([]).pipe(
          delay(300)
        ).subscribe(() => this.onViewAdjust());
      }
    });
  }

  /**
   * This determines what happened when Expand is called on the module.
   * Does "Expanding" collapse others in the different row and expand all modules in its own row? CASE 1
   * Does "Expanding" expand an already collapse module? CASE 2
   * @param module<string> Name of Module that "expand" was executed from.
   * @param init<boolean> Is this was initial bootup, do not save.
   */
  public onExpand(module: string, init?: boolean): void {
    let modules: ModuleDraggableItem[][];
    switch (module) {
      case Constants.DASHBOARD_MODS.PERSONAL_NOTES:
      case Constants.DASHBOARD_MODS.QUERY_TASK:
        modules = this.arrangeAndSortAllModulesToGrid();
        this.viewExpanded(module, modules);
        break;
      case Constants.DASHBOARD_MODS.NOTIFICATIONS:
      case Constants.DASHBOARD_MODS.MESSAGES:
        modules = this.viewNormal();
        this.changePositionValues(modules);
        break;
    }
  }

  /**
   * This determines what happened when Collapse is called on the module.
   * In this case you can only collapse and "Expanded" module. Case 1
   * @param module<string> Name of Module that "collapse" was executed from.
   */
  public onCollapse(module: string): void {
    switch (module) {
      case Constants.DASHBOARD_MODS.PERSONAL_NOTES:
      case Constants.DASHBOARD_MODS.QUERY_TASK:
        const modules = this.viewNormal();
        this.changePositionValues(modules);
        break;
    }
  }

  private calculateSize = (s1: number, s2: number): number => {
    let size;
    const totalChangeAmount = (s1 + s2) - 1;
    const changeFactor = s1 / (s1 + s2);
    const changeAmount = changeFactor * totalChangeAmount;
    size = s1 - changeAmount;
    return size;
  };

  private findRowSibling = (module: ModuleDraggableItem, modules: ModuleDraggableItem[][]): ModuleDraggableItem | null => {
    const row = Math.floor(module.data.rowColumn / 10);
    const column = module.data.rowColumn % 10;
    const returnModule = modules[row - 1][column === 1 ? 1 : 0];
    return returnModule?.data.name === module.data.name ? null : returnModule;
  };

  private findShortestSiblingInOppositeRow = (module: ModuleDraggableItem, modules: ModuleDraggableItem[][]): ModuleDraggableItem | null => {
    const row = Math.floor(module.data.rowColumn / 10);
    return modules[row === 1 ? 1 : 0].length > 0 ?
           modules[row === 1 ? 1 : 0].reduce((prev, current) => {
             return (prev.data.preferredHeight < current.data.preferredHeight) ? prev : current;
           }) : null;
  };

  private findShortestSiblingInSameRow = (module: ModuleDraggableItem, modules: ModuleDraggableItem[][]): ModuleDraggableItem | null => {
    const row = Math.floor(module.data.rowColumn / 10);
    return modules[row === 1 ? 0 : 1].length > 0 ?
           modules[row === 1 ? 0 : 1].reduce((prev, current) => {
             return (prev.data.preferredHeight < current.data.preferredHeight) ? prev : current;
           }) : null;
  };

  private reinitModuleViewFromData(modules?: ModuleDraggableItem[][]): void {
    let hasExpanded = false;
    this.allModules.forEach(module => {
      if (this.modulesMap.get(module.data.name)!.expanded) {
        switch (module.data.name) {
          case Constants.DASHBOARD_MODS.QUERY_TASK:
            this.onExpand(module.data.name, true);
        }
        hasExpanded = true;
      }
    });
    if (!hasExpanded) {
      modules = this.viewNormal();
      this.changePositionValues(modules);
    }
  }

  private viewNormal(): ModuleDraggableItem[][] {
    const modules: ModuleDraggableItem[][] = this.arrangeAndSortAllModulesToGrid();
    this.allModules.forEach(module => {
      module.data.collapsed$.next(false);
      module.data.expanded$.next(false);
      const shortSiblingOppositeRow = this.findShortestSiblingInOppositeRow(module, modules);
      const shortSiblingSameRow = this.findShortestSiblingInSameRow(module, modules);
      const rowSibling = this.findRowSibling(module, modules);
      module.data.height$.next(
        (100 -
          this.heightGapPercentage * (shortSiblingOppositeRow ? 3 : 2))
        * this.calculateSize(
          shortSiblingSameRow?.data.preferredHeight,
          shortSiblingOppositeRow ? shortSiblingOppositeRow.data.preferredHeight : 0));
      /** In case of minWidth conflict (i.e., a + b > 1 ).
       * If this is reused elsewhere may need to add logic for minHeight conflict as well*/
      if (rowSibling) {
        if (module.data.minWidth + rowSibling.data.minWidth > 1) {
          module.data.preferredWidth = module.data.minWidth / (module.data.minWidth + rowSibling.data.minWidth);
          rowSibling.data.preferredWidth = rowSibling.data.minWidth / (module.data.minWidth + rowSibling.data.minWidth);
        }
      }
      module.data.width$.next(
        (100 -
          this.widthGapPercentage * (rowSibling ? 3 : 2))
        * this.calculateSize(module.data.preferredWidth, rowSibling ? rowSibling.data.preferredWidth : 0)
      );
    });
    /** To eliminate rearranging and sorting of modules, pass it back to the caller */
    return modules;
  }

  private viewExpanded(expandedMod: string, modules: ModuleDraggableItem[][]): void {
    let expandedModule: ModuleDraggableItem;
    this.allModules.forEach(m => {
      if (m.data.name === expandedMod) {
        expandedModule = m;
      }
    });
    if (modules[0].length > 0 && modules[1].length > 0) {
      this.allModules.forEach(m => {
        if (Math.floor(m.data.rowColumn / 10) === Math.floor(expandedModule.data.rowColumn / 10)) {
          m.data.expanded = true;
          m.data.collapsed = false;
          m.data.expanded$.next(true);
          m.data.collapsed$.next(false);
          m.data.height$.next(100 - this.heightGapPercentage * 3 - this.collapsedModHeaderSize);
        } else {
          m.data.expanded = false;
          m.data.collapsed = true;
          m.data.expanded$.next(false);
          m.data.collapsed$.next(true);
          m.data.height$.next(this.collapsedModHeaderSize);
        }
        const rowSibling = this.findRowSibling(m, modules);
        m.data.width$.next(
          (100 -
            this.widthGapPercentage * (rowSibling ? 3 : 2))
          * this.calculateSize(m.data.preferredWidth, rowSibling ? rowSibling.data.preferredWidth : 0)
        );
      });
      this.changePositionValues(modules);
    }
  }

  private changePositionValues(modules: ModuleDraggableItem[][]): void {
    this.allModules.forEach(module => {
      let top = this.heightGapPercentage;
      let left = this.widthGapPercentage;
      switch (module.data.rowColumn) {
        case 12:
          left += modules[0].length > 1 ? modules[0][0].data.width$.value + this.widthGapPercentage : 0;
          break;
        case 21:
          top += modules[0].length > 0 ? modules[0][0].data.height$.value + this.heightGapPercentage : 0;
          break;
        case 22:
          top += modules[0].length > 0 ? modules[0][0].data.height$.value + this.heightGapPercentage : 0;
          left += modules[1].length > 1 ? modules[1][0].data.width$.value + this.widthGapPercentage : 0;
      }
      module.data.top$.next(top);
      module.data.left$.next(left);
    });
  }

  public changeColumnRowOrder(event: ModuleDroppableEventObject): { ORIGIN: string, DESTINATION: string } {
    /** Origin: event.data.rowColumn = where the dropped module came from
     * Destination: event.zone.data.rowColumn = where the dropped module is going to
     */
    const origin = event.data.rowColumn;
    const destination = event.zone.data.rowColumn;
    this.allModules.forEach(module => {
      switch (true) {
        /** for the module being replaced */
        case module.data.rowColumn === destination:
          module.data.rowColumn = origin;
          break;
        /** for the module that was moved */
        case module.data.rowColumn === origin:
          module.data.rowColumn = destination;
          break;
        /** for a row swap */
        // case origin < 20 && destination >= 20:
        // case origin >= 20 && destination < 20:
        //   switch (true) {
        //     /** for other modules in the same row that need to move */
        //     case (Math.floor(module.data.rowColumn / 10) * 10) === (Math.floor(destination / 10) * 10):
        //       module.data.rowColumn = (Math.floor(origin / 10) * 10) + module.data.rowColumn % 10;
        //       module.data.rowColumn = module.data.rowColumn === origin ? origin % 10 === 1 ? origin + 1 : origin - 1 : module.data.rowColumn;
        //       break;
        //     /** for other modules in the opposite row that need to move */
        //     case (Math.floor(module.data.rowColumn / 10) * 10) === (Math.floor(origin / 10) * 10):
        //       module.data.rowColumn = (Math.floor(destination / 10) * 10) + module.data.rowColumn % 10;
        //       module.data.rowColumn = module.data.rowColumn === destination ? destination % 10 === 1 ? destination + 1 : destination - 1 : module.data.rowColumn;
        //       break;
        //   }
        //   break;
      }
    });
    this.updateModules$(ModuleViewAdjustAction.rearrange);
    return { ORIGIN: event.data.name, DESTINATION: event.zone.data.name ? event.zone.data.name : 'New Row or Column' };
  }

  public onViewAdjust(): void {
    this.viewAdjust$.next(true);
    for (let m of this.allModules) {
      if ((m.data as ModuleData).collapsed$.value) {
        this.checkAndStoreModulesBeforeChanges();
        this.onExpand(m.data.name, true);
        break;
      }
    }
  }

  public checkAndStoreModulesBeforeChanges(): void {
    if (this.moduleDataAtViewAdjustStart === undefined) {
      this.moduleDataAtViewAdjustStart = this.prepareModulePrefData();
    }
  }

  public deleteModule(event: any): void {
    const origin = event.data.rowColumn;
    this.allModules.forEach(module => {
      if (module.data.rowColumn === origin) {
        this.allModules.splice(this.allModules.indexOf(module), 1);
        this.availableModules.push(module.data);
        this.availableModules$.next(this.availableModules);
      }
    });
    this.updateModules$(ModuleViewAdjustAction.rearrange);
  }

  public addModule(module: ModuleData): void {
    const pushModule = (rowCol: number) => {
      module.rowColumn = rowCol;
      switch (module.name) {
        case Constants.DASHBOARD_MODS.MESSAGES:
          this.allModules.push(this.messagesDraggable);
          break;
        case Constants.DASHBOARD_MODS.QUERY_TASK:
          this.allModules.push(this.queryTaskDraggable);
          break;
        case Constants.DASHBOARD_MODS.NOTIFICATIONS:
          this.allModules.push(this.notificationsDraggable);
          break;
        // case Constants.DASHBOARD_MODS.PERSONAL_NOTES:
        //   this.allModules.push(this.notesDraggable);
        //   break;
      }
      this.availableModules.splice(this.availableModules.indexOf(module), 1);
      this.availableModules$.next(this.availableModules);
      this.updateModules$(ModuleViewAdjustAction.rearrange);
    };

    let rowCol: number[] = [];
    this.allModules.forEach( m => rowCol.push(m.data.rowColumn));
    switch (-1) {
      case rowCol.indexOf(11):
        pushModule(11);
        break;
      case rowCol.indexOf(12):
        pushModule(12);
        break;
      case rowCol.indexOf(21):
        pushModule(21);
        break;
      case rowCol.indexOf(22):
        pushModule(22);
        break;
      default:
        this.toastService.show('No Module space available. Delete a module first', {classname: 'bg-danger text-white'});
    }
  }

  public onResize(axis: string, initialSizePercent: number, finalDeltaPx: number, row: number): any {
    const modules: ModuleDraggableItem[][] = this.arrangeAndSortAllModulesToGrid();
    const deltaWidthPercent = (finalDeltaPx) / (window.innerWidth - 66);
    const deltaHeightPercent = (finalDeltaPx) / (window.innerHeight - 66);
    const returnShrink = (delta: number, shrinkDimension: number, shrinkDimensionMinWidth: number): number => {
      delta = Math.abs(delta);
      return shrinkDimension - delta < shrinkDimensionMinWidth ? shrinkDimensionMinWidth : shrinkDimension - delta;
    };
    const returnExpand = (delta: number, expandDimension: number, shrinkDimensionMinWidth: number): number => {
      delta = Math.abs(delta);
      return expandDimension + delta > 1 - shrinkDimensionMinWidth ? 1 - shrinkDimensionMinWidth : expandDimension + delta;
    };
    let analyticsData = {};
    switch (axis) {
      case 'x':
        const modRow = modules[row - 1];
        if (modRow[0].data.minWidth + modRow[1].data.minWidth <= 1) {
          if (finalDeltaPx > 0) {
            modRow[1].data.preferredWidth = returnShrink(deltaWidthPercent, modRow[1].data.preferredWidth, modRow[1].data.minWidth);
            modRow[0].data.preferredWidth = returnExpand(deltaWidthPercent, modRow[0].data.preferredWidth, modRow[1].data.minWidth);
            analyticsData = {...analyticsData, X_DOWNSIZED_MODULE: modRow[1].data.name, X_UPSIZED_MODULE: modRow[0].data.name};
          } else {
            modRow[0].data.preferredWidth = returnShrink(deltaWidthPercent, modRow[0].data.preferredWidth, modRow[0].data.minWidth);
            modRow[1].data.preferredWidth = returnExpand(deltaWidthPercent, modRow[1].data.preferredWidth, modRow[0].data.minWidth);
            analyticsData = {...analyticsData, X_DOWNSIZED_MODULE: modRow[0].data.name, X_UPSIZED_MODULE: modRow[1].data.name};
          }
        } else {
          /** In case of minWidth conflict (i.e., a + b > 1 ).
           * If this is reused elsewhere may need to add logic for minHeight conflict as well*/
          modRow[0].data.preferredWidth = modRow[0].data.minWidth / (modRow[0].data.minWidth + modRow[1].data.minWidth);
          modRow[1].data.preferredWidth = modRow[1].data.minWidth / (modRow[0].data.minWidth + modRow[1].data.minWidth);
        }
        break;
      case 'y':
        const Y_DOWNSIZED_MODULES: string[] = [];
        const Y_UPSIZED_MODULES: string[] = [];
        if (finalDeltaPx > 0) {
          for (const mod of modules[1]) {
            mod.data.preferredHeight = returnShrink(deltaHeightPercent, mod.data.preferredHeight, mod.data.minHeight);
            Y_DOWNSIZED_MODULES.push(mod.data.name);
          }
          for (const mod of modules[0]) {
            mod.data.preferredHeight = returnExpand(deltaHeightPercent, mod.data.preferredHeight, this.findShortestSiblingInOppositeRow(mod, modules)?.data.minHeight);
            Y_UPSIZED_MODULES.push(mod.data.name);
          }
        } else {
          for (const mod of modules[0]) {
            mod.data.preferredHeight = returnShrink(deltaHeightPercent, mod.data.preferredHeight, mod.data.minHeight);
            Y_DOWNSIZED_MODULES.push(mod.data.name);
          }
          for (const mod of modules[1]) {
            mod.data.preferredHeight = returnExpand(deltaHeightPercent, mod.data.preferredHeight, this.findShortestSiblingInOppositeRow(mod, modules)?.data.minHeight);
            Y_UPSIZED_MODULES.push(mod.data.name);
          }
        }
        analyticsData = {...analyticsData, Y_DOWNSIZED_MODULE: Y_DOWNSIZED_MODULES.sort().join(', '), Y_UPSIZED_MODULES: Y_UPSIZED_MODULES.sort().join(', ')};
        break;
    }
    this.updateModules$(ModuleViewAdjustAction.resize, modules);
    return analyticsData;
  }

  prepareModulePrefData(): ModulePrefData[] {
    let modules: ModulePrefData[] = [];
    this.allModules.forEach(module => {
      let newMod = new ModulePrefData(module.data);
      newMod.preferredWidth = Number(newMod.preferredWidth.toFixed(4));
      newMod.preferredHeight = Number(newMod.preferredHeight.toFixed(4));
      newMod.expanded = module.data.expanded$.value;
      newMod.collapsed = module.data.collapsed$.value;
      modules.push(newMod);
    });
    return modules;
  }

  public restoreStoredModuleData(): void {
    if (this.moduleDataAtViewAdjustStart !== undefined) {
      this.availableModules = [];
      this.setAvailableModulesOnInit();

      this.allModules = [];
      this.moduleDataAtViewAdjustStart.forEach(modulePref => {  //build ModuleData for user's modules
        if (this.modulesMap.get(modulePref.name) !== undefined) {
          Object.assign(this.modulesMap.get(modulePref.name)!, modulePref);
          this.allModules.push(new ModuleDraggableItem(
            this.generateDropZones(modulePref.rowColumn),
            this.modulesMap.get(modulePref.name)
          ));
        }
      });
      //filter out selected modules from availableModules
      this.availableModules = this.availableModules.filter(mod => this.allModules.map(module => module.data).indexOf(mod) < 0);
      this.availableModules$.next(this.availableModules);

      let modules = this.arrangeAndSortAllModulesToGrid();
      this.modules$.next({ modules, type: ModuleViewAdjustAction.unknown });
      this.reinitModuleViewFromData(modules);
    }
    this.moduleDataAtViewAdjustStart = undefined;
    this.viewAdjust$.next(false);
  }

  private cancelViewAdjustOnUserChange(): void {
    this.moduleDataAtViewAdjustStart = undefined;
    this.viewAdjust$.next(false);
  }
}
