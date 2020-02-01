import { Component, OnInit } from '@angular/core';
import { PurchaseService } from 'src/app/services/purchase.service';
import { ActivatedRoute ,Router} from '@angular/router';

declare var UIkit: any;

@Component({
  selector: 'app-home',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects = []
  bgcolor = ""
  textcolor = ""
  project = {}
  startProject:number = -1;

  constructor(private route: ActivatedRoute,private router: Router, private purchaseService: PurchaseService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.startProject = params.get("project") ? parseInt( params.get("project") ) : -1;
      
    })
    if (localStorage.getItem('projects')) {
      this.projects = JSON.parse(localStorage.getItem('projects'));
      if (this.startProject != -1) {  
        this.onProject(this.startProject,null)
      }
    } else {

    
    this.purchaseService.getProjects()
      .subscribe(( projects ) => {
        
        if (projects && projects['result'] == 'ok'){
          this.projects = projects['data'];
          localStorage.setItem('projects', JSON.stringify(this.projects));
          if (this.startProject != -1) {  
           
            this.onProject(this.startProject,null)
          }
        }  else {
          console.log('Projects not found')
        }  
      });
    }
  }

  onProject(index, el: HTMLElement) {
    
    this.project = this.projects[index];
    this.bgcolor = this.projects[index]['bgcolor'];
    this.textcolor = this.projects[index]['textcolor'];
    UIkit.modal("#modal-project").show();
    UIkit.scroll('#projecttext',{'offset':200});
    
    if (el) {
     
      setTimeout( () => el.scrollIntoView({behavior:"smooth"}) , 1000);
      
    }
    // this.router.navigate(['/projects/'+ index]);
   
  }

  onHide() {
    
    UIkit.modal("#modal-project").hide()
    // this.router.navigate(['/projects']);
  }

}
