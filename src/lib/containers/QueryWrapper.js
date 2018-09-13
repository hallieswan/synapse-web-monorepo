import React from 'react'
import * as SynapseClient from 'lib/utils/SynapseClient'
import FacetsExperimental from './FacetsExperimental';

let INIT_REQUEST = "init request"

// takes in a token and SQL string and initQueryRequest
export default class QueryWrapper extends React.Component {

    constructor(){
        super()
        this.state = {
            data: [],
            originalFacets: [],
            isLoading: true,
            isLoadingInitRequest: true
        }
        this.makeQueryRequest = this.makeQueryRequest.bind(this)
    }

    componentDidMount() {
        this.makeQueryRequest(INIT_REQUEST)
    }

    makeQueryRequest(queryRequest) {
        this.setState({isLoading: true})
        if (queryRequest === INIT_REQUEST) {
            SynapseClient.getQueryTableResults(this.props.initQueryRequest, this.props.token).then(
                data => {
                    this.setState({
                        originalFacets: data,
                        data,
                        isLoadingInitRequest: false,
                        isLoading: false
                    })
                }
            )   
        } else {
            SynapseClient.getQueryTableResults(queryRequest, this.props.token).then(
                data => {
                    this.setState({
                        data,
                        isLoading: false
                    })
                }
            )
        }
    }

    render () {
        return (
            <div> 
                {React.Children.map(this.props.children, child =>{
                    return React.cloneElement(child, {showBy: "Disease", isLoading: this.state.isLoading, isLoadingInitRequest: this.state.isLoadingInitRequest, updateQueryRequest: this.makeQueryRequest, originalFacets: this.state.originalFacets, data: this.state.data, sql: this.props.sql,
                    })
                })} 
            </div>
        )
    }
}