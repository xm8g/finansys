import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Category } from '../shared/category';
import { CategoryService } from '../shared/category.service';
import toastr  from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  categoryForm!: FormGroup;
  currentAction!: string;
  pageTitle!: string;
  errorMessages: string[] = [];
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildForm();
    this.loadCategory();

  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  }

  /*************************************************************/

  private setCurrentAction() {
    this.activatedRoute.snapshot.url[0].path === 'new'
      ? this.currentAction = 'new'
      : this.currentAction = 'edit'
  }

  private buildForm() {
    this.categoryForm = new FormGroup(
      {
        id: new FormControl(null),
        name: new FormControl('', [Validators.required, Validators.minLength(2)]),
        description: new FormControl(''),
      },
    )
  }

  loadCategory() {
    if (this.currentAction == 'edit') {
      this.activatedRoute.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+(params.get('id') ?? '0')))
      ).subscribe({
        next: (category) => {
          this.category = category;
          this.categoryForm.patchValue(category) //binds loaded category data to category form
        },
        error: (error) => alert("Ocorreu um erro no servidor, tente mais tarde")
      })
    }
  }

  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de Nova Categoria'
    } else {
      const categoryName = this.category.name ?? "";
      this.pageTitle = 'Atualizando Categoria...: ' + categoryName;
    }

  }

  private updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.update(category).subscribe({
      next: category => this.actionsForSuccess(category),
      error: error => this.actionsForError(error)
    })
  }

  private createCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.create(category).subscribe({
      next: category => this.actionsForSuccess(category),
      error: error => this.actionsForError(error)
    })
  }

  private actionsForError(error: any): void {
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
  private actionsForSuccess(category: Category): void {
    toastr.success('Solicitação processada com sucesso');
    this.router
      //não adiciona essa navegação no histórico do navegador
      .navigateByUrl('categories', { skipLocationChange: true })
      .then(
        () => this.router.navigate(['categories', category.id, 'edit'])
      )
  }


}
