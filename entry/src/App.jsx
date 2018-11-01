import React from 'react';
import axios from 'axios';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: 'placeholder'
        }
    }

    componentWillMount() {
        this.getData();
    }

    componentDidMount() {
        this.isUnmount = false;
    }

    componentWillUnmount() {
        this.isUnmount = true;
    }

    getData() {
        this.setState({
            loading: true
        });
        axios.get('/api', {
            params: {
                action: 'test',
            }
        }).then(res => {
            console.log('res', res)
            this.setState({
                data: res.data,
                loading: false
            })
        }).catch(err => {
            console.error('err', err)
            this.setState({
                data: err,
                loading: false
            })
        })

    }

    render() {
        const { loading, data } = this.state;
        const str = JSON.stringify(data)
        return (
            <div>
                {loading ? 'loading' : str}
            </div>
        )
    }
}