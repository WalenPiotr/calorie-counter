import * as React from "react";
import Widget from "@elements/Widget";
export interface MainProps {}

export default class Main extends React.Component<MainProps, any> {
    public render() {
        return (
            <Widget>
                <h1>Calorie Counter App</h1>
                <h2>Features</h2>
                <ul>
                    <li>User accounts with daily food dairies</li>
                    <li>Global product list</li>
                    <li>Product voting mechanism</li>
                    <li>
                        Admin panel with option to ban user, remove and update
                        products on global list
                    </li>
                    <li>
                        Password remind and user verification via mail using
                        Gmail API
                    </li>
                </ul>
                <h2>Project structure</h2>
                <div>
                    Whole application deployed with docker-compse on Digital
                    Ocean droplet. Each part of application is designed as
                    separate docker image:
                </div>
                <ul>
                    <li>database (postgres)</li>
                    <li>backend server (build with golang)</li>
                    <li>
                        user client (build with React and launched on Node
                        server)
                    </li>
                    <li>
                        admin client (build with React and launched on Node
                        server)
                    </li>
                </ul>
                <h2> Live demo </h2>
                <div>Use following credentials to login</div>
                <div>Email: kcalccountapp@gmail.com</div>
                <div>Password: zxcASDqwe123</div>
            </Widget>
        );
    }
}
