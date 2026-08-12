import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { debounceTime } from "rxjs";
import { HelpArticle, HelpCenterData } from "@app/features/support/domain/models";
import { SupportService } from "@app/features/support/infrastructure/support.service";
import { PageHeaderComponent } from "@app/shared/page-header/page-header.component";
import { PageLayoutComponent } from "@app/shared/page-layout/page-layout.component";
import { PageFormBodyComponent } from "@app/shared/page-form-body/page-form-body.component";
import { FormBodyComponent } from "@app/shared/form-body/form-body.component";
import { CardComponent } from "@app/shared/ui/card/card.component";
import { InputComponent } from "@app/shared/ui/input/input.component";
import { ToastComponent, ToastVariant } from "@app/shared/ui/toast/toast.component";

interface ArticleGroup {
  category: string;
  articles: HelpArticle[];
}

@Component({
  selector: "app-help-center",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, InputComponent, PageHeaderComponent, PageLayoutComponent, PageFormBodyComponent, FormBodyComponent, ToastComponent, TranslateModule],
  templateUrl: "./help-center.component.html",
  styleUrls: ["./help-center.component.scss"],
})
export class HelpCenterComponent {
  private readonly supportService = inject(SupportService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  data = signal<HelpCenterData | null>(null);

  toast = signal<{
    visible: boolean;
    title: string;
    message: string;
    variant: ToastVariant;
  }>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
  });

  searchForm = this.fb.group({
    query: [""],
  });

  readonly query = signal("");

  readonly groupedArticles = computed<ArticleGroup[]>(() => {
    const raw = this.data()?.articles ?? [];
    const query = this.query().trim().toLowerCase();

    const filtered = query
      ? raw.filter((article) => {
          const haystack = `${article.title} ${article.content} ${
            article.tags?.join(" ") ?? ""
          }`.toLowerCase();
          return haystack.includes(query);
        })
      : raw;

    const map = new Map<string, HelpArticle[]>();
    filtered.forEach((article) => {
      const key = article.category || "General";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(article);
    });

    return Array.from(map.entries()).map(([category, articles]) => ({
      category,
      articles,
    }));
  });

  constructor() {
    this.loadHelpCenter();

    this.searchForm.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.query.set(String(value.query ?? ""));
      });
  }

  hideToast(): void {
    this.toast.update((current) => ({ ...current, visible: false }));
  }

  private loadHelpCenter(): void {
    this.loading.set(true);
    this.supportService.getHelpCenter().subscribe({
      next: (data) => {
        this.data.set(data || { categories: [], articles: [] });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast("Failed to load help center", "danger", "Error");
      },
    });
  }

  private showToast(message: string, variant: ToastVariant, title = ""): void {
    this.toast.set({ visible: true, title, message, variant });
  }
}
