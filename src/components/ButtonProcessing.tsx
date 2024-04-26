import React, { FC } from 'react'
import { Button, ButtonProps, Spinner } from 'react-bootstrap'

interface IProps {
    processing?: boolean
    icon?: string
}

export const AdvancedButton: FC<IProps & ButtonProps> = ({ children, processing, disabled, icon, ...rest }) => {
    let prefix = null;
    if (processing) {
        prefix = <Spinner size='sm' className='me-2' />
    } else if (icon) {
        prefix = <i className={`bi ${icon} me-2`} />
    }

    return (
        <Button {...rest} disabled={processing || disabled}>
            <div className='center'>{prefix} {children}</div>
        </Button>
    )
}
