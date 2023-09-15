import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaidService } from '../core/services/plaid.service';

@Component({
  selector: 'family-budget-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  linkToken = null;

  constructor(
    public plaidService: PlaidService
  ) {}

  ngOnInit(): void {

  }
}
