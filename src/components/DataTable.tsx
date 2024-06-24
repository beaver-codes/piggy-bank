import React from 'react'
import { Table } from 'react-bootstrap'


export function DataTable<T>(props: {
    data: T[],
    columns: {
        label: string,
        key?: keyof T,
        render?: (item: T, ix: number) => JSX.Element | string
        skip?: (item: T) => boolean,
        align?: 'left' | 'right' | 'center',
    }[],
    className?: string
    title?: string
    noHover?: boolean
    onRowClick?: (row: T) => void
}) {
    const skipColumnsIx: number[] = []
    for (let ix = 0; ix < props.columns.length; ix++) {
        const col = props.columns[ix]
        if (col.skip) {
            const skip = props.data.filter(col.skip)
            if (skip.length === props.data.length) {
                skipColumnsIx.push(ix)
            }
        }
    }
    const visibleColumns = props.columns.filter((col, ix) => !skipColumnsIx.includes(ix))
    const showHeader = !props.title;


    return <>
        {showHeader && <h2>{props.title}</h2>}
        <Table className={props.className} hover striped variant='light'>
            <thead>
                <tr>
                    {visibleColumns.map((col, ix) => <th key={ix}
                        style={{ textAlign: col.align || 'left' }}
                    >
                        {col.label}
                    </th>)}
                </tr>
            </thead>
            <tbody>
                {props.data.map((item, ix) => <tr key={ix} onClick={() => props.onRowClick && props.onRowClick(item)}>
                    {visibleColumns.map((col, colIx) => {
                        let content: JSX.Element | string | null = null;
                        if (col.render) {
                            content = col.render(item, ix)
                        } else if (!!col.key) {
                            content = <>{item[col.key]}</>
                        }

                        return <td key={colIx}
                            style={{ textAlign: col.align || 'left' }}
                        >
                            {content}
                        </td>
                    })}
                </tr>)}
            </tbody>
        </Table>
    </>

}