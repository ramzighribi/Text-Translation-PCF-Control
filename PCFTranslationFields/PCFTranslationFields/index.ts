import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { stringify } from "querystring";
import { isString, isNullOrUndefined, isNull } from "util";
import { transcode } from "buffer";

export class PCFTranslationFields implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;
	private _container: HTMLDivElement;
	private _TextToBeTranslatedElement: HTMLInputElement;
	private _ShowTranslatedText: HTMLElement;
	private _HideTranslatedText: HTMLElement;
	public _TranslatedTextArea: HTMLElement;
	private _TextToBeTranslated: string;
	// Event listener for changes in the credit card number
	private _TextToBeTranslatedChanged: EventListenerOrEventListenerObject;
	private _translationResult: string;
	public _languages: string;
	public _Selectedlanguage: string;
	public _selectElement: HTMLSelectElement;
	private _refreshData: EventListenerOrEventListenerObject;


	constructor() {

	}




	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {

		this._context = context;
		this._notifyOutputChanged = notifyOutputChanged;
		this._container = container;
		this._translationResult = "";
		this._Selectedlanguage = "";



		// Add the textbox control, styling and event listener
		this._TextToBeTranslatedElement = document.createElement("input");
		this._TextToBeTranslatedElement.setAttribute("type", "text");
		this._TextToBeTranslatedElement.setAttribute("class", "pcfinputcontrol");
		//this._TextToBeTranslatedElement.addEventListener('change', this.HideTranslatedMessage );
		this._TextToBeTranslatedElement.addEventListener("change", this.onChange.bind(this));

		var crmOriginalTextAttribute = this._context.parameters.TextToTranslate.attributes?.LogicalName;


		//@ts-ignore

		this._TextToBeTranslatedElement.value = Xrm.Page.getAttribute(crmOriginalTextAttribute).getValue();

		// Add a visual to show the error message when the message is translated
		this._TranslatedTextArea = document.createElement("div");
		this._TranslatedTextArea.setAttribute("class", "pcferrorcontroldiv");

		//Create The message element formated
		var _TranslatedMessageValue = document.createElement("label");
		_TranslatedMessageValue.setAttribute("class", "pcftranslationcontrollabel")
		_TranslatedMessageValue.innerText = "";

		this._TranslatedTextArea.appendChild(_TranslatedMessageValue);
		this._TranslatedTextArea.style.display = "none";



		this._selectElement = document.createElement("select");
		this._selectElement.setAttribute("class", "pcfselectcontrol")


		var languageList = document.createElement("option");



		let optionList = this._selectElement.options;
		let options = [
			{
				text: 'Select',
				value: 'var0',
				selected: true

			},
			{
				text: 'Ar',
				value: 'var1',

			},
			{
				text: 'De',
				value: 'var2',

			},
			{
				text: 'Es',
				value: 'var3'
			},
			{
				text: 'Fr',
				value: 'var4',

			},
			{
				text: 'Zh',
				value: 'var5',

			}
		];

		options.forEach(option =>
			optionList.add(
				new Option(option.text, option.value, option.selected)
			)
		);


		var ShowButton = document.createElement("button");
		//ShowButton.setAttribute("style", "background-color:#ffffff");

		ShowButton.innerHTML = "︾";

		ShowButton.addEventListener("click", this.onButtonClick.bind(this));


		this._selectElement.addEventListener('change', this.onButtonClick.bind(this));


		//hide message area
		var HideButton = document.createElement("button");
		HideButton.innerHTML = "︽";
		HideButton.addEventListener("click", this.HideTranslatedMessage.bind(this));
		this._languages = languageList.value;
		this._container.appendChild(this._TextToBeTranslatedElement);


		this._container.appendChild(this._selectElement);
		//this._container.appendChild(HideButton);
		this._container.appendChild(this._TranslatedTextArea);


		//@ts-ignore
		this._TextToBeTranslatedElement.value == Xrm.Page.getAttribute(crmOriginalTextAttribute).getValue();

	}

	public updateView(context: ComponentFramework.Context<IInputs>): void {

		//@ts-ignore
		this._TextToBeTranslatedElement.value == Xrm.Page.getAttribute(crmOriginalTextAttribute).getValue();

		//}
	}

	private onChange(evt: Event): void {


		var crmOriginalTextAttribute = this._context.parameters.TextToTranslate.attributes?.LogicalName;


		//@ts-ignore
		//alert("CRM field value : " + Xrm.Page.getAttribute(crmOriginalTextAttribute).getValue());

		//@ts-ignore
		Xrm.Page.getAttribute(crmOriginalTextAttribute).setValue(this._TextToBeTranslatedElement.value);


		this._notifyOutputChanged();
	}

	public onButtonClick(event: Event): void {

		this._Selectedlanguage = "";

		function Translate(targetLang = "", text = "", sourceLang = 'auto') {

			var result = "";
			fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(text)).then(function (res) {
				if (res.status >= 200 && res.status < 300) {
					return Promise.resolve(res)
				} else {
					return Promise.reject(new Error(res.statusText))
				}
			}).then(function (res) {
				return res.json()
			}).then(function (data) {



				result = data[0][0][0];

				document.getElementsByClassName("pcftranslationcontrollabel")[0].innerHTML = result;
			}).catch(function (err) {
				alert("Request failed : " + err);
			});
			return result;
		}

		if (this._TextToBeTranslatedElement.value !== "" && this._selectElement.options[this._selectElement.selectedIndex].text !== "Select") {

			this._Selectedlanguage = this._selectElement.options[this._selectElement.selectedIndex].text;
			this._TextToBeTranslated = this._TextToBeTranslatedElement.value;
			this._translationResult = Translate(this._Selectedlanguage, this._TextToBeTranslated);
			this._TranslatedTextArea.style.display = "block";
		}

		else {

			if (this._selectElement.options[this._selectElement.selectedIndex].text === "" || this._TextToBeTranslatedElement.value === "") {

				document.getElementsByClassName("pcftranslationcontrollabel")[0].innerHTML = "";
				this._TranslatedTextArea.style.display = "none";

			}


		}


	}


	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {


	}


	public HideTranslatedMessage(): void {
		document.getElementsByClassName("pcftranslationcontrollabel")[0].innerHTML = "";
		this._TranslatedTextArea.style.display = "none";

	}

	public getOutputs(): IOutputs {
		return {
			//TextToTranslate: this._TextToBeTranslated;

		};

	}
}
