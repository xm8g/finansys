import { Component, Injector } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseResourceFormComponent } from '../../../shared/components/base-resource-form/base-resource-form.component';
import { Category } from '../shared/category';
import { CategoryService } from '../shared/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent extends BaseResourceFormComponent<Category> {

  constructor(
    protected override injector: Injector,
    protected categoryService: CategoryService
  ) {
    super(injector, new Category(), categoryService, Category.fromJson)
  }

  protected buildForm() {
    this.resourceForm = new FormGroup(
      {
        id: new FormControl(null),
        name: new FormControl('', [Validators.required, Validators.minLength(2)]),
        description: new FormControl(''),
      },
    )
  }

  protected createPageTitle(): string {
    return "Cadastro de nova categoria";
  }
  protected editionPageTitle(): string {
    const categoryName = this.resource.name ?? '';
    return "Editando categoria: " + categoryName;
  }

}
