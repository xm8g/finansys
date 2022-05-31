import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import currencyFormatter from 'currency-formatter';
import { Category } from '../../categories/shared/category';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from '../../entries/shared/entry';
import { EntryService } from '../../entries/shared/entry.service';

interface ChartAxis {
  categoryName: string;
  totalAmount: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  expenseTotal: any = 0;
  revenueTotal: any = 0;
  balance: any = 0;

  expenseChartData: any;
  revenueChartData: any;

  chartOptions = {
    scales: {
      yAxis: {
        ticks: {
          beginAtZero: true
        }
      }
    }
  }



  categories: Category[] = [];
  entries: Entry[] = [];

  @ViewChild('month') month!: ElementRef<any>;
  @ViewChild('year') year!: ElementRef<any>;

  constructor(
    private categoryService: CategoryService,
    private entryService: EntryService) { }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    );

  }

  generateReports() {
    const month = this.month.nativeElement.value;
    const year = this.year.nativeElement.value;
    if (!month || !year) {
      alert('Selecione o mês e/ou ano.')
    } else {
      this.entryService.getByMonthAndYear(month, year).subscribe(this.setValues.bind(this));
    }
  }

  private setValues(entries: Entry[]) {
    this.entries = entries;
    this.calculateBalance();
    this.setChartData();
  }

  private calculateBalance() {
    let expenseTotal = 0;
    let revenueTotal = 0;

    this.entries.forEach(entry => {
      if (entry.typeEntry == 'revenue' && entry.amount) {
        revenueTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' })
      } else if (entry.typeEntry == 'expense' && entry.amount) {
        expenseTotal += currencyFormatter.unformat(entry.amount, { code: 'BRL' })
      }
    })
    this.expenseTotal = currencyFormatter.format(expenseTotal, { code: 'BRL' });
    this.revenueTotal = currencyFormatter.format(revenueTotal, { code: 'BRL' });
    this.balance = currencyFormatter.format(revenueTotal - expenseTotal, { code: 'BRL' });
  }

  private setChartData() {
    this.revenueChartData = this.getChartData('revenue', 'Receitas', '#9CCC65');
    this.expenseChartData = this.getChartData('expense', 'Despesas', '#E03131');

  }

  private getChartData(entryType: string, title: string, color: string) {

    const chartData: ChartAxis[] = [];

    this.categories.forEach(category => {
      //filtrando lançamentos pela categoria e tipo
      const filteredEntries = this.entries.filter(
        entry => (entry.categoryId == category.id) && entry.typeEntry == entryType
      );
      //se achou lançamentos, então soma e adiciona ao chartData
      if (filteredEntries.length > 0) {
        let totalAmount = filteredEntries.reduce(
          (total, entry) => total + currencyFormatter.unformat(entry.amount ?? '0', { code: 'BRL' }), 0
        )
        chartData.push({
          categoryName: category.name ?? '',
          totalAmount: totalAmount
        })
      }
    });

    let a = {
      labels: chartData.map(item => item.categoryName),
      datasets: [{
        label: title,
        backgroundColor: color,
        data: chartData.map(item => item.totalAmount)
      }]
    }
    console.log(a);
    return a;
  }

}
