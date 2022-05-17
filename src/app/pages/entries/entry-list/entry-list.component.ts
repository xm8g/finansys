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
    this.entryService.getAll().subscribe({
      next: entries => this.entries = entries,
      error: error => alert('Erro ao carregar as lista de lançamentos')
    });


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
