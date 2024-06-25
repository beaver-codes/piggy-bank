import React, { FC } from 'react'
import { Container, NavDropdown, Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { texts } from '../utils/texts'
import { SUPPORT_EMAIL } from '../utils/shared/constants'

interface IProps {
    public?: boolean
    handleLogout?: () => void
}

interface CustomNavItemProps extends React.ComponentProps<typeof NavDropdown.Item> {
    icon: string;
}

const IconNavItem: React.FC<CustomNavItemProps> = (props) => {
    const { icon, children, ...rest } = props;
    return <NavDropdown.Item {...rest as any}>
        <i className={`bi ${icon} me-2`} />{children}
    </NavDropdown.Item>;
};


export const Header: FC<IProps> = (props) => {
    const renderItems = () => {
        if (props.public) {
            return <></>
        }
        return <>
            <NavDropdown title={'Menu'} menuVariant='right' >
                <IconNavItem href={`mailto:${SUPPORT_EMAIL}`} icon="bi-question-circle">Support</IconNavItem>
                <NavDropdown.Divider />
                <IconNavItem icon="bi-box-arrow-right" onClick={props.handleLogout}>{texts.logout}</IconNavItem >
            </NavDropdown>
        </>
    }

    return (
        <Navbar expand="lg" className="text-primary">
            <Container>
                <Link to={'/'}><Navbar.Brand className="text-primary">{texts.brand}</Navbar.Brand></Link>
                {renderItems()}
            </Container>
        </Navbar>
    )
}
