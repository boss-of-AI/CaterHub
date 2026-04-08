import { AuthPage } from "@refinedev/antd";

export const Login = () => {
    return (
        <AuthPage
            type="login"
            formProps={{
                initialValues: {
                    email: "admin@caterme.com",
                    password: "mumbai2026",
                },
            }}
            title={
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h1 style={{ color: '#f97316', fontWeight: 'bold', fontSize: '24px' }}>
                        CaterMe Mumbai
                    </h1>
                    <p style={{ color: '#666' }}>Admin Control Panel</p>
                </div>
            }
            rememberMe={false}
            forgotPasswordLink={false}
            registerLink={false}
        />
    );
};