import React from "react"
import { Detector } from "react-detect-offline"

const CheckConnection = props => {
    return (
        <>
            <Detector
            render = {( {online} ) => (
                online ? props.childern:
                <div>Sei offline collegati ad internet</div>
            )}
            />
        </>
    )
}

export default CheckConnection;