import {Component} from '@angular/core';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownMenu,
  NgbDropdownModule,
  NgbDropdownToggle
} from "@ng-bootstrap/ng-bootstrap";
import {Confirmable} from "../../decorators/Confirmable";
import {LogoutActionService} from "../../../../features/auth/actions/logout-action.service";
import {UserStoreService} from "../../../../features/user/infrastructure/services/user-store.service";
import {map} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {TextShorterPipe} from "../../pipes/wallet-address-shortener.pipe";
import {RouterLink} from "@angular/router";
import {BreakPoints, ScreenBreakPointsService} from "../../services/screen-break-points.service";

@Component({
  selector: 'app-user-profile-selector',
  standalone: true,
  imports: [
    NgbDropdownModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    AsyncPipe,
    TextShorterPipe,
    RouterLink
  ],
  templateUrl: './user-profile-selector.component.html',
  styleUrl: './user-profile-selector.component.scss'
})
export class UserProfileSelectorComponent {
  currentBreakpoint$ = this.screenBreakpointService.observeBreakpoints();
  hideName$ = this.currentBreakpoint$.pipe(map(value => {
    return value <= BreakPoints.MD;
  }));
  userWallet$ = this.userStore
    .selectOnly(state => state.user?.wallet_address)
    .pipe(
      map(wallet => {
        if (!wallet) {
          return 'No hi ha cap wallet assignada'
        }

        return new TextShorterPipe().transform(wallet, 6, 4);
      })
    );
  firstName = this.userStore.selectOnly(state => state.user?.firstname)
    .pipe(
      map(username => username || 'Anònim'),
    );

  constructor(
    private readonly logoutAction: LogoutActionService,
    private readonly userStore: UserStoreService,
    private readonly screenBreakpointService: ScreenBreakPointsService,
  ) {
  }

  @Confirmable("Estas segur?", {confirmButton: 'Tancar sessió', cancelButton: 'Mantenir sessió'})
  async logout() {
    await this.logoutAction.run();
  }

}
