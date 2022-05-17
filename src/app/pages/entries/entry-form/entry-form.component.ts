import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Entry } from '../shared/entry';
import { EntryService } from '../shared/entry.service';

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

  constructor(
    private entryService: EntryService,
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildForm();
    this.loadEntry();

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

  /*************************************************************/

  private setCurrentAction() {
    this.activatedRoute.snapshot.url[0].path === 'new'
      ? this.currentAction = 'new'
      : this.currentAction = 'edit'
  }

  private buildForm() {
    this.entryForm = new FormGroup(
      {
        id: new FormControl(null),
        name: new FormControl('', [Validators.required, Validators.minLength(2)]),
        description: new FormControl(null),
        //type: new FormControl(null, [Validators.required]),
        //amount: new FormControl(null, [Validators.required]),
        //date: new FormControl(null, [Validators.required]),
        //paid: new FormControl(null, [Validators.required]),
        //categoryId: new FormControl(null, [Validators.required])
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
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.update(entry).subscribe({
      next: entry => this.actionsForSuccess(entry),
      error: error => this.actionsForError(error)
    })
  }

  private createEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.create(entry).subscribe({
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
    toastr.success('Solicitação processada com sucesso');
    this.router
      //não adiciona essa navegação no histórico do navegador
      .navigateByUrl('entries', { skipLocationChange: true })
      .then(
        () => this.router.navigate(['entries', entry.id, 'edit'])
      )
  }

}
