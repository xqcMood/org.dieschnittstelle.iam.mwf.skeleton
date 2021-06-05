/**
 * @author Jörn Kreutel
 */
import {mwf} from "../Main.js";
import {entities} from "../Main.js";

export default class ListviewViewController extends mwf.ViewController {

    constructor() {
        super();
        this.resetDatabaseElement = null;

        console.log("ListviewViewController()");

        this.items = [
            new
            entities.MediaItem("m1","https://placeimg.com/100/100/city"),
            new
            entities.MediaItem("m2","https://placeimg.com/200/150/music"),
            new
            entities.MediaItem("m3","https://placeimg.com/150/200/culture")
        ];
        this.addNewMediaItemElement = null;

    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        this.initialiseListview(this.items);
        this.addNewMediaItemElement =
            this.root.querySelector("#addNewMediaItem");
        this.addNewMediaItemElement.onclick = (() => {
            //this.crudops.create(new entities.MediaItem("m","https://placeimg.com/100/100/city")).then((created) =>
            //{
           //     this.addToListview(created);
           // }
        //);
            this.createNewItem();
        });

        this.addListener(new
            mwf.EventMatcher("crud","deleted","MediaItem"),((event)=> {
                this.removeFromListview(event.data);
            })
        );
        this.addListener(new mwf.EventMatcher("crud","created","MediaItem"),((event) => {
        this.addToListview(event.data);
    }));
        this.addListener(new mwf.EventMatcher("crud","updated","MediaItem"),((event) => {
        this.updateInListview(event.data._id,event.data);
    }));
        this.addListener(new mwf.EventMatcher("crud","deleted","MediaItem"),((event) => {
        this.removeFromListview(event.data);
    }));
        //switch from local to remote
        var refreshButton = this.root.getElementsByClassName("mwf-imgbutton mwf-right-align mwf-img-refresh")[0];
        refreshButton.onclick = () => {
            if (this.application.currentCRUDScope == "local"){
                this.application.switchCRUD("remote");
            }
            else {
                this.application.switchCRUD("local");
            }
            this.startView(this.application.currentCRUDScope);
        };

        //this.crudops.readAll().then((items) => {
        //    this.initialiseListview(items);
        //});

        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });

        this.resetDatabaseElement =
            this.root.querySelector("#resetDatabase");
        this.resetDatabaseElement.onclick = (() => {
            if (confirm("Soll die Datenbank wirklich zurückgesetzt werden?")) {
                    indexedDB.deleteDatabase("mwftutdb");
        }
    });
        // call the superclass once creation is done
        super.oncreate();
    }

    // Initializes list view and displays text field for the used storage location (local/remote)
    startView(state) {
        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });
        var dbStatusText = document.getElementById("database-status");
        if (state == 'local') {
            dbStatusText.innerHTML = "local";
        }
        else{
            dbStatusText.innerHTML = "remote";
        }
    }

    createNewItem() {
        var newItem = new
        entities.MediaItem("","https://placeimg.com/100/100/city");
        this.showDialog("mediaItemDialog", {
            item: newItem,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    newItem.create().then(() => {
                        this.addToListview(newItem);
                    });
                    this.hideDialog();
                })
            }
        });
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */


    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(listitem, listview) {
        // TODO: implement how selection of listitem shall be handled
        this.nextView("mediaReadview",{item: listitem});
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(option, listitem, listview) {
        // TODO: implement how selection of option for listitem shall be handled
        super.onListItemMenuItemSelected(option, listitem, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialog, item) {
        // call the supertype function
        super.bindDialog(dialogid, dialog, item);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromSubview(subviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        if (subviewid == "mediaReadview" && returnValue &&
            returnValue.deletedItem) {
            this.removeFromListview(returnValue.deletedItem._id);
        }
    }

    showDeleteItemDialog(item) {
        //this.crudops.delete(item._id).then(() => {
        //    this.removeFromListview(item._id);
        //});
        this.showDialog("mediaItemDeleteDialog", {
            item: item,
            actionBindings: {
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();
                })
            }
        });
    }

    deleteItem(item) {
        //this.crudops.delete(item._id).then(() => {
        //    this.removeFromListview(item._id);
        //});
        item.delete(() => {
            this.removeFromListview(item._id);
        });
    }

    editItem(item) {
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        this.updateInListview(item._id,item);
                    });
                    this.hideDialog();
                })
                ,/*!!!*/
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();
                })
            }
        });
    }

}

