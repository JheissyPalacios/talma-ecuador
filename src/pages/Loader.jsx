import React from 'react'
import '../style/Loader.scss'

export default function Loader() {
  return (
    <div className="loader">
        <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
        </div>
    </div>
  )
}
