# 背景介绍
Bloom filter(后面简称BF)是Bloom在1970年提出的二进制向量数据结构。通俗来说就是在大数据集合下高效判断某个成员是否属于这个集合。BF其优点在于：

1. 插入和查询复杂度都是O(n)
2. 空间利用率极高。

例如：邮件服务提供商，总是需要过滤垃圾邮件。 假设有50亿个邮件地址，需要存储过滤的方法有：

所有邮件地址都存储到数据库。
缺点：每次都需要查询数据库，效率低。
使用Hashtable保存到内存里，接近O(1)的查询效率。
缺点：太占内存，假定每个地址需要十六个字符，50亿个需要180G内存。
创建位数组，将每个邮件地址用Hash函数映射到位数组中的某一位。
缺点： 单个Hash函数冲突太高，会发生多个邮件会映射到同一位上。
而使用BF可以最大限度避免上述缺点，使其可以在更小空间上，进行高效插入和查询。

使用缓存如果每次不命中就意味着一次跨网络通信的浪费，无故增加缓存服务器压力。使用BF可以在很大程度上提高缓存命中率。

# 算法原理
BF对同一个邮件地址使用多个不同的Hash函数，再去映射位数组的中对应位置。

算法步骤：
1. 创建长度为m的位数组，全部置为0。
2. 取出邮件地址集合(m)中的某一个地址(a), 分别使用k个hash函数对a计算。
3. 将结果分别映射到位数组中，并设置为1。
4. 其他成员依次处理。

以函数个数k=8来算，50亿个邮件地址只需要5G内存足够了，当查询成员a时是否在垃圾邮件集合m中时，使用同样k个hash函数进行计算，如果k个结果在位数组中的位值都是1，则判断a属于m集合中，即a邮件地址属于垃圾邮件地址集合m(a∈m)。


存在？去远程获取实际缓存内容。
不存在？直接返回，无需再去远程缓存服务器判断。
这样能极大提高缓存命中率，因为BF存在误判率，所有并不能达到100%(在key的数量级不高时，用其他方法全存下来也可以)。如图：

# 使用场景
BF是大数据处理的利器，其使用场景非常多：

1. 爬虫重复URL检测
2. 黑名单验证
3. 缓存命中率
4. 垃圾邮件过滤
5. 内存挡一层，减轻db空查压力
6. hbase、LevelDB内部使用

# C#算法实现
```C#
    /// <summary>
    /// A Bloom filter is a space-efficient probabilistic data structure 
    /// that is used to test whether an element is a member of a set. False 
    /// positives are possible, but false negatives are not. Elements can 
    /// be added to the set, but not removed.
    /// </summary>
    /// <typeparam name="Type">Data type to be classified</typeparam>
    public class BloomFilter<T>
    {
        Random _random;
        int _bitSize, _numberOfHashes, _setSize;
        BitArray _bitArray;

        #region Constructors
        /// <summary>
        /// Initializes the bloom filter and sets the optimal number of hashes. 
        /// </summary>
        /// <param name="bitSize">Size of the bloom filter in bits (m)</param>
        /// <param name="setSize">Size of the set (n)</param>
        public BloomFilter(int bitSize, int setSize)
        {
            _bitSize = bitSize;
            _bitArray = new BitArray(bitSize);
            _setSize = setSize;
            _numberOfHashes = OptimalNumberOfHashes(_bitSize, _setSize);
        }

        /// <summary>
        /// Initializes the bloom filter with a manual number of hashes.
        /// </summary>
        /// <param name="bitSize">Size of the bloom filter in bits (m)</param>
        /// <param name="setSize">Size of the set (n)</param>
        /// <param name="numberOfHashes">Number of hashing functions (k)</param>
        public BloomFilter(int bitSize, int setSize, int numberOfHashes)
        {
            _bitSize = bitSize;
            _bitArray = new BitArray(bitSize);
            _setSize = setSize;
            _numberOfHashes = numberOfHashes;
        }
        #endregion

        #region Properties
        /// <summary>
        /// Number of hashing functions (k)
        /// </summary>
        public int NumberOfHashes
        {
            set
            {
                _numberOfHashes = value;
            }
            get
            {
                return _numberOfHashes;
            }
        }

        /// <summary>
        /// Size of the set (n)
        /// </summary>
        public int SetSize
        {
            set
            {
                _setSize = value;
            }
            get
            {
                return _setSize;
            }
        }

        /// <summary>
        /// Size of the bloom filter in bits (m)
        /// </summary>
        public int BitSize
        {
            set
            {
                _bitSize = value;
            }
            get
            {
                return _bitSize;
            }
        }
        #endregion

        #region Public Methods
        /// <summary>
        /// Adds an item to the bloom filter.
        /// </summary>
        /// <param name="item">Item to be added</param>
        public void Add(T item)
        {
            _random = new Random(Hash(item));

            for (int i = 0; i < _numberOfHashes; i++)
                _bitArray[_random.Next(_bitSize)] = true;
        }

        /// <summary>
        /// Checks whether an item is probably in the set. False positives 
        /// are possible, but false negatives are not.
        /// </summary>
        /// <param name="item">Item to be checked</param>
        /// <returns>True if the set probably contains the item</returns>
        public bool Contains(T item)
        {
            _random = new Random(Hash(item));

            for (int i = 0; i < _numberOfHashes; i++)
            {
                if (!_bitArray[_random.Next(_bitSize)])
                    return false;
            }

            return true;
        }

        /// <summary>
        /// Checks if any item in the list is probably in the set.
        /// </summary>
        /// <param name="items">List of items to be checked</param>
        /// <returns>True if the bloom filter contains any of the items in the list</returns>
        public bool ContainsAny(List<T> items)
        {
            foreach (T item in items)
            {
                if (Contains(item))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Checks if all items in the list are probably in the set.
        /// </summary>
        /// <param name="items">List of items to be checked</param>
        /// <returns>True if the bloom filter contains all of the items in the list</returns>
        public bool ContainsAll(List<T> items)
        {
            foreach (T item in items)
            {
                if (!Contains(item))
                    return false;
            }

            return true;
        }

        /// <summary>
        /// Computes the probability of encountering a false positive.
        /// </summary>
        /// <returns>Probability of a false positive</returns>
        public double FalsePositiveProbability()
        {
            return Math.Pow((1 - Math.Exp(-_numberOfHashes * _setSize / (double)_bitSize)), _numberOfHashes);
        }
        #endregion

        #region Private Methods
        /// <summary>
        /// Hashing function for an object
        /// </summary>
        /// <param name="item">Any object</param>
        /// <returns>Hash of that object</returns>
        private int Hash(T item) {
            return item.GetHashCode();
        }

        /// <summary>
        /// Calculates the optimal number of hashes based on bloom filter
        /// bit size and set size.
        /// </summary>
        /// <param name="bitSize">Size of the bloom filter in bits (m)</param>
        /// <param name="setSize">Size of the set (n)</param>
        /// <returns>The optimal number of hashes</returns>
        private int OptimalNumberOfHashes(int bitSize, int setSize)
        {
            return (int)Math.Ceiling((bitSize / setSize) * Math.Log(2.0));
        }
        #endregion
    }
```