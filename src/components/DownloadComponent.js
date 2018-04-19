import React, { Component } from 'react';
import UniqueLeadsComponent from './UniqueLeadsComponent';

import '../../style/style.scss';

/*
    This component downloads and consolidates duplicate leads.

    The meat of the logic is present in this component.
 */
class DownloadComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            downloadedJSON: [],
            graphOfLeads: {},
            consolidatedDuplicates: [],
        }
    }

    render = () => {
        return(
            <div>
                <div>
                    <input className="download-button btn btn-outline-danger" type='file' onChange={this.downloadJSONAndDeDuplicate}/>
                </div>
                <UniqueLeadsComponent consolidatedDuplicates={this.state.consolidatedDuplicates} />
            </div>
        );
    };

    downloadJSONAndDeDuplicate = (event) => {
        const reader = new FileReader();

        if(event.target.files[0]) {
            reader.readAsText(event.target.files[0]);
        }

        reader.onload = () => {
            try {
                const temp = JSON.parse(JSON.stringify(reader.result));
                const downloadedJSON = JSON.parse(temp)['leads'];

                this.setState({downloadedJSON}, this.addPositionPropertyToObjects);
                this.createGraphFromTheJSON();
                this.consolidateDuplicates();
                this.sortConsolidatedDuplicatesByDate();
            } catch(err) {
                alert("Something went wrong. Maybe a wrong file format!\n" +
                    "Expected format of the JSON file is: {'example': [{...}, {...}, ...]}.\n" +
                    "Or refer to the leads.json file given with the project.");
                location.reload();
            }
        };
    };

    /*
        This method adds a field 'position' to the objects, which is used
        as a tie breaker when two duplicate leads have the same entryDate.
        Lead with a higher position is the preferred one.
     */
    addPositionPropertyToObjects = () => {
        const {downloadedJSON} = this.state;
        downloadedJSON.forEach(function(row, index) {
            row.position = index;
        });
        this.setState({ downloadedJSON });
    };

    /*
        Create an adjacency list to denote the graph.
        The mapping is from _id's to elements which have the same _id
        and from email's to elements which have the same email.
     */
    createGraphFromTheJSON = () => {
        const { downloadedJSON } = this.state;
        const graphOfLeads = {};

        for (const obj in downloadedJSON) {
            const currObj = downloadedJSON[obj];
            if (currObj['email'] in graphOfLeads) {
                graphOfLeads[currObj['email']].push(currObj);
            }
            if (currObj['_id'] in graphOfLeads) {
                graphOfLeads[currObj['_id']].push(currObj);
            }
            if(!(currObj['email'] in graphOfLeads)){
                graphOfLeads[currObj['email']] = [currObj];
            }
            if(!(currObj['_id'] in graphOfLeads)){
                graphOfLeads[currObj['_id']] = [currObj];
            }
        }

        this.setState({ graphOfLeads });
    };

    /*
        This method goes over the nodes in the adjacency list.
        How it works: We only iterate over lists of lead objects which
        shared the same _id. For each element in the list, we pick its email
        and iterate over the list of lead objects with that email, and
        after that list is exhausted, we continue with the next lead object in the _id list.
        It is a kind of modified DFS where I am using a dictionary to keep track
        of the visited nodes and form arrays of similar lead objects (for fast lookup).
        Important thing to note here is, because of navigating through the graph
        in such a manner, we get access to the Transitive Property of Equality,
        which is if a == b and b == c then a == c.
     */
    consolidateDuplicates = () => {
        const { graphOfLeads } = this.state;
        const visitedNodes = {};
        const consolidatedDuplicates = [];

        for (const key in graphOfLeads) {
            if (!(/(.+)@(.+){2,}\.(.+){2,}/.test(key))) { //Regex to skip over 'email' properties, since they will be visited from leads in the various _id properties.

                const currentArray = graphOfLeads[key];
                const currentSetOfDuplicateLeads = new Set([]);

                for (const index in currentArray) {
                    const currentEmail = currentArray[index]['email'];

                    if (!(currentEmail in visitedNodes)) {

                        currentSetOfDuplicateLeads.add(currentArray[index]);
                        visitedNodes[currentEmail] = true;
                        visitedNodes[currentArray[index]['_id']] = true;
                        const currentEmailsNeighbors = graphOfLeads[currentEmail];

                        for (const index in currentEmailsNeighbors) {
                            if (!(currentEmailsNeighbors[index]['_id'] in visitedNodes)) {
                                currentSetOfDuplicateLeads.add(currentEmailsNeighbors[index]);
                            }
                        }
                    }
                }

                if (currentSetOfDuplicateLeads.size > 0) {
                    consolidatedDuplicates.push(Array.from(currentSetOfDuplicateLeads));
                }
            }
        }
        this.setState({ consolidatedDuplicates });
    };

    /*
        This method is responsible for sorting (descending) the individual arrays of similar leads.
        First we check their dates, if dates are same we check their position in the original list,
        which is done using the 'position' field entered in the 'addPositionPropertyToObjects' method.
     */
    sortConsolidatedDuplicatesByDate = () => {
        const { consolidatedDuplicates } = this.state;

        for (const index in consolidatedDuplicates) {
            consolidatedDuplicates[index].sort((a, b) =>  {
                if ((new Date(a['entryDate'])) < (new Date(b['entryDate']))) {
                    return 1;
                }
                if ((new Date(a['entryDate'])) > (new Date(b['entryDate']))) {
                    return -1;
                }
                if (a['position'] < b['position']) {
                    return 1;
                }
                if (a['position'] > b['position']) {
                    return -1;
                } else {
                    return 0;
                }
            })
        }
        this.setState({ consolidatedDuplicates })
    };
}

export default DownloadComponent;