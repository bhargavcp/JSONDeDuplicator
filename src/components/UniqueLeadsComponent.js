import React, { Component } from 'react';
import ViewDiffComponent from './ViewDiffComponent';

import '../../style/style.scss';

/*
    This component displays the array of unique lead objects right below the file upload button.

    This component does not have any business logic as such.
 */
class UniqueLeadsComponent extends Component {

    render = () => {
        if (this.props.consolidatedDuplicates.length > 0) {
            return(
                <div className="unique-leads">
                    <div className="card" >
                        <div className="card-header">
                            Unique Leads
                        </div>
                        <ul className="list-group list-group-flush">
                            {this.getListOfUniqueLeads()}
                        </ul>
                    </div>
                    <ViewDiffComponent consolidatedDuplicates={this.props.consolidatedDuplicates} />
                </div>
            );
        }
        return <div />;
    };

    /*
        This method is responsible for return an array of unique lead objects to display.
     */
    getListOfUniqueLeads = () => {
        const temp = this.props.consolidatedDuplicates;
        return temp.map((leadsArray, index) => {
            const lead = leadsArray[0];
            delete lead.position;
            return (
                <li key={index} className="list-group-item">{JSON.stringify(lead, null, "\t")}</li>
            );
        })
    };
}

export default UniqueLeadsComponent;
