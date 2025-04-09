import Trie "mo:base/Trie";
  
type Key<K> = Trie.Key<K>;

type Secret = {
  id: Nat;
  principal_id : Text;
  title : Text;
  website : Text;
  description : Text;
  secret : Text;
};

type User = {
  principal_id: Text;
  username : Text;
  secret_key : Text;
};
