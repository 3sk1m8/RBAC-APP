import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

const primeNgModules = [
  ButtonModule,
  CardModule,
  InputTextModule,
  PasswordModule,
  TableModule,
  ToastModule,
  MessageModule,
  MessagesModule,
  TagModule
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...primeNgModules
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...primeNgModules
  ],
  providers: [
    MessageService
  ]
})
export class SharedModule { }