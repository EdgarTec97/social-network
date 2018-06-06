import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';
import { GLOBAL } from '../../services/global';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UploadService } from '../../services/upload.service';


@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.css'],
	providers: [UserService, PublicationService]
})
export class SidebarComponent implements OnInit {
	public title: string;
	public identity;
	public token;
	public stats;
	public url;
	public status;
	public publication: Publication;

	constructor(
		private _route             : ActivatedRoute,
		private _router            : Router,
		private _userService       : UserService,
		private _publicationService: PublicationService,
		private _uploadService     : UploadService
		) { 
		this.title = "Tus datos...";
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.stats = this._userService.getStats();
		this.url = GLOBAL.url;
		this.publication = new Publication('', '', '', '', this.identity._id);
	}

	ngOnInit() { }

	onSubmit(form){
		this._publicationService.newPublication(this.token, this.publication).subscribe(
			response => {
				if(response.publicationStored){
					this.publication = response.publicationStored;
					this.status = 'success';
					this.stats.publications += 1;

					if(this.filesToUpload != null){
						this._uploadService.makeFileRequest(this.url+'upload-image-pub/'+this.publication._id, [], this.filesToUpload, this.token, 'image').then((result: any) => {
							//console.log(result);
							this.publication.file = result.publication.file;
						});
					}

					form.reset();
					this._router.navigate(['/timeline']);
				}else{
					this.status = 'error';
				}

			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				if(errorMessage != null){
					this.status = 'error';
				}
			}
			);
	}

	public filesToUpload: Array<File>;
	fileChangeEvent(fileInput: any){
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}


	// Output --> ponemos la etiqueta "@Output" y la propiedad que es el evento
	@Output() publicationSended = new EventEmitter();
	sendPublication(event){
		this.publicationSended.emit({send:'true'});
	}
}

