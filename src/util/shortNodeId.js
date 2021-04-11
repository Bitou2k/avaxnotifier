function shortNodeId(nodeID = '') {
  if (!nodeID) {
    return nodeID
  }
  return `${nodeID.substring(0, 10)}...${nodeID.substring(nodeID.length - 4)}`
}

module.exports = shortNodeId
