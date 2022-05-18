import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { switchMap } from 'rxjs';
import { Entry } from '../shared/entry';
import { EntryService } from '../shared/entry.service';
import { Category } from '../../categories/shared/category';
import { CategoryService } from '../../categories/shared/category.service';
import { TypeEntry } from '../shared/type-entry';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit {

  entryForm!: FormGroup;
  currentAction!: string;
  pageTitle!: string;
  errorMessages: string[] = [];
  submittingForm: boolean = false;
  entry: Entry = new Entry();
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
    private entryService: EntryService,
    private config: PrimeNGConfig,
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private router: Router) { }

  ngOnInit(): void {


    this.translateFieldDate();
    this.setCurrentAction();
    this.loadEntry();
    this.buildForm();
    this.loadCategories();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
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

  /*************************************************************/

  private setCurrentAction() {
    this.activatedRoute.snapshot.url[0].path === 'new'
      ? this.currentAction = 'new'
      : this.currentAction = 'edit'
  }

  private buildForm() {
    this.entryForm = new FormGroup(
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

  loadEntry() {
    if (this.currentAction == 'edit') {
      this.activatedRoute.paramMap.pipe(
        switchMap(params => this.entryService.getById(+(params.get('id') ?? '0')))
      ).subscribe({
        next: (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(entry) //binds loaded entry data to entry form
        },
        error: (error) => alert("Ocorreu um erro no servidor, tente mais tarde")
      })
    }
  }

  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de Novo Lançamento'
    } else {
      const entryName = this.entry.name ?? "";
      this.pageTitle = 'Atualizando lançamento...: ' + entryName;
    }

  }

  private updateEntry() {
    const entry: Entry = Entry.fromJson(this.entryForm.value);
    this.entryService.update(entry)?.subscribe({
      next: entry => this.actionsForSuccess(entry),
      error: error => this.actionsForError(error)
    })
  }

  private createEntry() {
    const entry: Entry = Entry.fromJson(this.entryForm.value);
    this.entryService.create(entry)?.subscribe({
      next: entry => this.actionsForSuccess(entry),
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
   * * /entries
   * * /entries/id/edit
   */
  private actionsForSuccess(entry: Entry): void {
    toastr.success('Lançamento processado com sucesso');
    this.router
      //não adiciona essa navegação no histórico do navegador
      .navigateByUrl('entries', { skipLocationChange: true })
      .then(
        () => this.router.navigate(['entries', entry.id, 'edit'])
      )
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories = categories
    })
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
