import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { visibility, flyInOut, expand } from '../animations/app.animation';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {
  @Input()
  commentsForm!: FormGroup;
  comment!: Comment;
  dish!: Dish;
  dishIds!: string[];
  prev!: string;
  next!: string;
  errMess!: string;
  dishcopy!: Dish;
  visibility = 'shown';


  @ViewChild('fform') commentsFormDirective: any;
  formErrors: any = {
    'author': '',
    'comment': '',
  };

  validationMessages: any = {
    'author': {
      'required': 'Author name is required.',
      'minlength': 'Author Name must be at least 2 characters long.',
    },
    'comment': {
      'required': 'Comment is required.',
    }
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location, private fb: FormBuilder,
    @Inject('BaseURL') public BaseURL: any) {
    this.createForm();
  }

  createForm() {
    this.commentsForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      comment: ['', [Validators.required]],
      rating!: '5',
      date!: '',
    });

    this.commentsForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.commentsForm) { return; }
    const form = this.commentsForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
  onSubmit() {
    this.comment = this.commentsForm.value;
    const date = new Date();
    this.comment.date = date.toISOString();
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
        errmess => { this.dish == null; this.dishcopy == null; this.errMess = <any>errmess; });

    console.log(this.comment);
    this.commentsForm.reset({
      comment!: '',
      author!: '',
      date!: '',
    });
    this.commentsFormDirective.resetForm({ rating: 5 });
  }
  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds,
      errmess => this.errMess = <any>errmess);
    // const id = this.route.snapshot.params['id'];
    // this.dishservice.getDish(id).subscribe(dish => this.dish = dish);

    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

}
