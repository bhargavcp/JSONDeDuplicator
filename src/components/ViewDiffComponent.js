import React, { Component } from 'react';

import '../../style/style.scss';

/*
    This component displays the diff between the lead objects.
    For an array of similar leads, it displays the unique
    lead which is picked, on top of the list. After that, it displays
    all the similar lead objects with a diff showing what fields
    are identical and non-identical between that particular object
    and the lead chosen from that list (which is on top of the list).

    The methods mainly have UI related logic and no business logic as such.
 */
class ViewDiffComponent extends Component {

    render = () => {
        if (this.props.consolidatedDuplicates.length > 0) {
            return (
                <div>
                    <div className="diff-div card" >
                        <div className="card-header">
                            Diff Between Unique Leads and Their Duplicates. <br />
                            Rows in <b className="blue">Blue</b> are the Unique
                            Leads Followed by Their Duplicates in
                            <b className="grey"> Grey</b>. <br />
                            Note about how equality is calculated: <br />
                            If two leads have the exact same _id or email,
                            they straight away qualify as duplicates.
                            However, according to transitive property of equality,
                            if obj1[_id] == obj2[_id] and obj2[email] == obj3[email],
                            then obj1 == obj3.
                            In other words, if a == b and b == c, then a == c.
                        </div>
                    </div>
                    {this.getDiffOfUniqueLeadsWithDuplicates()}
                </div>
            )
        }
        return <div />
    };

    getDiffOfUniqueLeadsWithDuplicates = () => {
        return this.props.consolidatedDuplicates.map((leadsArray, index) => {
            const uniqueLead = leadsArray[0];
            const leadsDiffJSXArray = leadsArray.map((lead, index) => {
                return this.getDiffBetweenLeads(uniqueLead, lead, index);
            });

            return (
                <div key={index} id={index} className="row">
                    <div className="col-12">
                        <div className="list-group" id="list-tab" role="tablist">
                            {leadsDiffJSXArray}
                        </div>
                    </div>
                </div>
            );
        })
    };

    getDiffBetweenLeads = (uniqueLead, duplicateLead, index) => {
        if (index === 0) {
            return (
                <div
                    className="list-group-item list-group-item-action active"
                    id="list-home-list"
                    role="tab"
                    key={index}>
                    {JSON.stringify(uniqueLead, null, "\t")}
                 </div>
            );
        } else {
            const reasonForCountingAsDuplicate = uniqueLead['email'] === duplicateLead['email']
                                                ? 'These leads have the same email.'
                                                : uniqueLead['_id'] === duplicateLead['_id']
                                                ? 'These leads have the same _id.'
                                                : 'These leads are similar by Transitive Property of Equality.';
            const keys = Object.keys(uniqueLead);
            const similarKeys = [];
            const uniqueKeys = [];

            for (const i in keys) {
                if (uniqueLead[keys[i]] === duplicateLead[keys[i]]) {
                    similarKeys.push(keys[i]);
                } else {
                    uniqueKeys.push(`${keys[i]}: ${duplicateLead[keys[i]]}`)
                }
            }

            return (
                <div key={index} className="list-group-item list-group-item-action">
                    <div className="reason-for-diff">{reasonForCountingAsDuplicate}</div>
                    <div className="row">
                    <div className="col-6">
                        <div className="identical-keys">
                            Identical Keys Between The Two Leads
                        </div>
                        <div>
                            { similarKeys.map(key => <p key={key}>{key}</p>) }
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="non-identical-keys">
                            Non-identical Keys Between The Two Leads
                        </div>
                        <div>
                            { uniqueKeys.map(key => <p key={key}>{key}</p>) }
                        </div>
                    </div>
                    </div>
                </div>
            );
        }
    }
}

export default ViewDiffComponent;


