import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../shared/category.service';
import { Category } from '../shared/category';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories = categories,
      error: error => alert('Erro ao carregar as lista de categorias')
    });
  }

  deleteCategory(category: Category) {
    const mustDelete = confirm("Deseja realmente excluir este item ?");
    if (category && category.id && mustDelete) {
      this.categoryService.delete(category.id).subscribe({
        next: () => this.categories = this.categories.filter(element => element.id != category.id),
        error: error => alert('Erro ao deletar item de categorias')
      });
    }
  }

}
