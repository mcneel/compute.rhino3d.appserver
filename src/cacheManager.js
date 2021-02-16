const NodeCache = require('node-cache')

class CacheManager {
  constructor ( ) {
    this.cache = new NodeCache()
    this.data = []
  }

  set ( key, value ) {
    this.checkData ( key )
    return this.cache.set( key, value )
  }

  get ( key ) {
    this.checkData ( key )
    return this.cache.get ( key )
  }

  keys () {
    return this.cache.keys()
  }

  checkData ( key ) {

    const keyObj = JSON.parse( key )
    delete keyObj.definition.id
    const keyStr = JSON.stringify( keyObj )

    const index = this.data.findIndex( d => d.key === keyStr )
    if ( index > -1 ) {
      this.data[ index ].count ++
    } else {
      this.data.push( { key: keyStr, count: 1 } )
    }

  }

}

module.exports = CacheManager
