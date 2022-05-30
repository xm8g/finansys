import { Component, Injector, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { switchMap } from 'rxjs';
import { Entry } from '../shared/entry';
import { EntryService } from '../shared/entry.service';
import { Category } from '../../categories/shared/category';
import { CategoryService } from '../../categories/shared/category.service';
import { TypeEntry } from '../shared/type-entry';
import { BaseResourceFormComponent } from '../../../shared/components/base-resource-form/base-resource-form.component';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent extends BaseResourceFormComponent<Entry> implements OnInit {

  categories!: Category[];

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  }

  constructor(
    protected override injector: Injector,
    private entryService: EntryService,
    private config: PrimeNGConfig,
    private categoryService: CategoryService
  ) {
    super(injector, new Entry(), entryService, Entry.fromJson)
  }

  override ngOnInit(): void {

    this.translateFieldDate();
    this.loadCategories();
    super.ngOnInit();
  }


  get typeOptions(): TypeEntry[] {

    return Object.entries(Entry.types).map(
      ([v, t]) => {
        return {
          optionValue: v,
          optionText: t
        }
      }
    )
  }

  protected buildForm() {
    this.resourceForm = new FormGroup(
      {
        id: new FormControl(-1),
        typeEntry: new FormControl('', [Validators.required]),
        name: new FormControl('', [Validators.required, Validators.minLength(2)]),
        description: new FormControl(null),
        amount: new FormControl(null, [Validators.required]),
        date: new FormControl(null, [Validators.required]),
        paid: new FormControl(true, [Validators.required]),
        categoryId: new FormControl(null, [Validators.required])
      },
    )
  }

  /*************************************************************/

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories = categories
    })
  }

  protected createPageTitle(): string {
    return "Cadastro de novo lançamento";
  }
  protected editionPageTitle(): string {
    const lancamento = this.resource.name ?? '';
    return "Editando Lançamento: " + lancamento;
  }

  translateFieldDate() {
    this.config.setTranslation({
      firstDayOfWeek: 0,
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
      monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar'
    });
  }

}
