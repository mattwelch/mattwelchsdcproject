//import 'babel-polyfill';
import React, { Component } from 'react';
import Button from '@splunk/react-ui/Button';
import Heading from '@splunk/react-ui/Heading';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Message from '@splunk/react-ui/Message';
import DashboardCore from '@splunk/dashboard-core';
import DefaultPreset from '@splunk/dashboard-presets/DefaultPreset';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import authClient from './auth';
 
const definition = {
    dataSources: {
        length_search: {
            options: {
                query: `| from main | where duration != null AND year != 0 |  stats avg('duration') by year`,
                queryParameters: {
                    earliest: '0',
                    latest: 'now',
                },
            },
            type: 'ds.search',
        }
    },
    visualizations: {
        song_length_chart: {
            type: 'viz.line',
            title: 'Song Lengths per Year',
            options: {
                "axisTitleX.text": "Year",
                "axisTitleY.text": "Duration (seconds)"
            },
            dataSources: {
                primary: 'length_search',
            },
        }
    },
    layout: {
        type: 'grid',
        options: {
            columns: 12,
        },
        structure: [
 
            {
                item: 'song_length_chart',
                position: {
                    x: 1,
                    y: 1,
                    w: 12,
                    h: 4,
                },
            }
        ],
    },
};
class Dashboard extends Component {
    state = {
        loggedIn: false,
        error: null,
        userInfo: null,
    };
    componentDidMount() {
        this.authenticate();
    }
    authenticate = async () => {
        try {
            // authClient redirects to the login page if the user is not authenticated

            const authenticated = await authClient.checkAuthentication();
            this.setState({
                loggedIn: authenticated,
                userInfo: authenticated ? authClient.getUserInfo().payload : null,
            });
        } catch (ex) {
            this.setState({
                loggedIn: false,
                error: ex.message,
            });
        }
    };
    render() {
        const { loggedIn, error, userInfo } = this.state;
        if (error) {
            return <Message type="error">{error}</Message>;
        }
        if (!loggedIn) {
            return <WaitSpinner screenReaderText="Loading..." />;
        }
        return (
            <div>
                <Heading level={1}>
                    {`Enjoy this representation of song lengths over the years, ${userInfo.name}`}
                    <br />
                    <br />
                    <Button
                        label="Logout"
                        appearance="primary"
                        onClick={() => {
                            authClient.logout();
                        }}
                    />
                </Heading>
                <DashboardContextProvider
                    dataSourceContext={{
                        cloudApiUrl: 'https://api.splunkbeta.com',
                        tenantId: 'mwelch', // Replace with your tenant name - second instance.
                        authClient: authClient, // authClient instance from @splunk/cloud-auth
                    }}
                >
                    <DashboardCore
                        width="100%"
                        height={700}
                        preset={DefaultPreset}
                        definition={definition}
                    />
                </DashboardContextProvider>
            </div>
        );
    }
}
export default Dashboard;