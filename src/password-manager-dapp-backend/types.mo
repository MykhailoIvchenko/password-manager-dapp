import Trie "mo:base/Trie";

type Key<K> = Trie.Key<K>;

type Secret = {
  principal_id : Text;
  title : Text;
  website : Text;
  description : Text;
  secret : Blob;
};

type User = {
  principal_id: Text;
  username : Text;
  secret_key_hash : Blob;
};