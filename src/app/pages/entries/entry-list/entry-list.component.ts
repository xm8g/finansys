import { Component, OnInit } from '@angular/core';
import { Entry } from '../shared/entry';
import { EntryService } from '../shared/entry.service';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[] = [];

  constructor(private entryService: EntryService) { }


  ngOnInit(): void {
    //Lista de lançamentos ordenada por id
    this.entryService.getAll().subscribe({
      next: entries => this.entries = entries.sort((a, b) => this.ordena(a,b)),
      error: error => alert('Erro ao carregar as lista de lançamentos')
    });


  }

  private ordena(a: Entry, b: Entry): number {
    if (a && a.id && b && b.id) {
      return b.id - a.id;
    }
    return 0;
  }

  deleteEntry(entry: Entry) {
    const mustDelete = confirm("Deseja realmente excluir este item ?");
    if (entry && entry.id && mustDelete) {
      this.entryService.delete(entry.id).subscribe({
        next: () => this.entries = this.entries.filter(element => element.id != entry.id),
        error: error => alert('Erro ao deletar item de lançamento')
      });
    }
  }

}
