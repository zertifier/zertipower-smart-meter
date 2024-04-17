import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ZertiauthApiService} from "../../services/zertiauth-api.service";
import {firstValueFrom} from "rxjs";
import {ethers} from "ethers";
import {AuthStoreService} from "../../services/auth-store.service";
import {ApiService} from "../../../../shared/infrastructure/services/api.service";

@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [],
  templateUrl: './login-callback.component.html',
  styleUrl: './login-callback.component.scss'
})
export class LoginCallbackComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly zertiauthApiService: ZertiauthApiService,
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly authStore: AuthStoreService,
  ) {
  }

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const code: string = params['code'];

    if (!code) {
      throw new Error('Code not received from oauth');
    }

    const response = await firstValueFrom(this.zertiauthApiService.getPrivateKey(code));
    const wallet = new ethers.Wallet(response.privateKey as string);

    // login
    const tokens = await this.apiService.auth.login(wallet.address, wallet.privateKey, response.email);

    // TODO migrate user updater to event system
    this.authStore.setTokens({refreshToken: tokens.refreshToken, accessToken: tokens.accessToken});
    this.router.navigate(['/energy-stats']);
  }
}
