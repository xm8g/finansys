import { AfterContentChecked, Component, Directive, Inject, Injectable, Injector, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import toastr from 'toastr';
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

@Directive()
export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  resourceForm!: FormGroup;
  currentAction!: string;
  pageTitle!: string;
  errorMessages: string[] = [];
  submittingForm: boolean = false;

  protected activatedRoute: ActivatedRoute;
  protected router: Router

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData: any) => T
  ) {
    this.router = this.injector.get(Router);
    this.activatedRoute = this.injector.get(ActivatedRoute);

  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildForm();
    this.loadResource();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  protected abstract buildForm(): void

  /*************************************************************/

  protected setCurrentAction() {
    this.activatedRoute.snapshot.url[0].path === 'new'
      ? this.currentAction = 'new'
      : this.currentAction = 'edit'
  }

  protected loadResource() {
    if (this.currentAction == 'edit') {
      this.activatedRoute.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+(params.get('id') ?? '0')))
      ).subscribe({
        next: (resource) => {
          this.resource = resource;
          this.resourceForm.patchValue(resource) //binds loaded resource data to resource form
        },
        error: (error) => alert("Ocorreu um erro no servidor, tente mais tarde")
      })
    }
  }

  protected setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = this.createPageTitle();
    } else {
      this.pageTitle = this.editionPageTitle();
    }

  }

  protected updateResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.resourceService.update(resource).subscribe({
      next: resource => this.actionsForSuccess(resource),
      error: error => this.actionsForError(error)
    })
  }

  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    this.resourceService.create(resource).subscribe({
      next: resource => this.actionsForSuccess(resource),
      error: error => this.actionsForError(error)
    })
  }

  protected abstract createPageTitle(): string;

  protected abstract editionPageTitle(): string;

  protected actionsForError(error: any): void {
    toastr.error('Ocorreu um erro ao processar a requisição!');
    this.submittingForm = false;

    if (error.status == 422) {
      this.errorMessages = JSON.parse(error._body).errors;
    } else {
      this.errorMessages = ["Erro interno do servidor. Por favor tente mais tarde."]
    }
  }

  /**
   * & Redireciona para a lista e logo depois pra tela de edição do item criado
   * * /categories
   * * /categories/id/edit
   */
   protected actionsForSuccess(resource: T): void {
    toastr.success('Solicitação processada com sucesso');

     const baseComponentPath = this.activatedRoute.snapshot.parent?.url[0].path;

    this.router
      //não adiciona essa navegação no histórico do navegador
      .navigateByUrl('categories', { skipLocationChange: true })
      .then(
        () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
      )
  }


}
