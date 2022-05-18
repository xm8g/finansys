import { Category } from "../../categories/shared/category";
import { BaseResourceModel } from '../../../shared/models/base-resource.model';

export class Entry extends BaseResourceModel {
  constructor(
    public override id?: number,
    public name?: string,
    public description?: string,
    public typeEntry?: string,
    public amount?: string,
    public date?: string,
    public paid?: boolean,
    public categoryId?: number,
    public category?: Category
  ) {
  super();
  }

  static types = {
    expense: 'Despesa',
    revenue: 'Receita'
  }

  get paidText(): string {
    return this.paid ? 'Pago' : 'Pendente';
  }

  static fromJson(jsonData: any): Entry {
    return Object.assign(new Entry(), jsonData);
  }

}
