import React, { FC } from 'react'
import { Container, NavDropdown, Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { texts } from '../utils/texts'

interface IProps {
    public?: boolean
    handleLogout?: () => void
}

export const Header: FC<IProps> = (props) => {
    const renderItems = () => {
        if (props.public) {
            return <></>
        }
        return <>
            <NavDropdown title={'Menu'} menuVariant='right' >
                <NavDropdown.Item onClick={props.handleLogout}>{texts.logout}</NavDropdown.Item>
            </NavDropdown>
        </>
    }

    return (
        <Navbar expand="lg" className="">
            <Container>
                <Link to={'/'}><Navbar.Brand>🐷 {texts.brand}</Navbar.Brand></Link>
                {renderItems()}
            </Container>
        </Navbar>
    )
}
