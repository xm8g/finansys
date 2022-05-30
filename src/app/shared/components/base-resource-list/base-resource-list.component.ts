import { Directive, OnInit } from '@angular/core';
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

@Directive()
export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {

  resources: T[] = [];

  constructor(private resourceService: BaseResourceService<T>) {

  }

  ngOnInit(): void {
    this.resourceService.getAll().subscribe({
      next: resources => this.resources = resources,
      error: error => alert('Erro ao carregar as lista de categorias')
    });
  }

  deleteResource(resource: T) {
    const mustDelete = confirm("Deseja realmente excluir este item ?");
    if (resource && resource.id && mustDelete) {
      this.resourceService.delete(resource.id).subscribe({
        next: () => this.resources = this.resources.filter(element => element.id != resource.id),
        error: error => alert('Erro ao deletar item de categorias')
      });
    }
  }

}
